// All video generation happens client-side: draw frames to a <canvas>,
// capture the canvas as a MediaStream, and record it with MediaRecorder.
// No server, no upload of the customer's photos anywhere.

export const TIMING = {
  before: 2.0, // seconds holding on the "before" photo
  transition: 0.6, // seconds crossfading/wiping between photos
  after: 2.6, // seconds holding on the "after" photo
};

export const TOTAL_SECONDS = TIMING.before + TIMING.transition + TIMING.after;

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Draws `img` into the rect (x, y, w, h) with CSS object-fit: cover behaviour,
// optionally scaled by `zoom` (>= 1) around the rect's center for a subtle
// Ken Burns effect.
function drawImageCover(ctx, img, x, y, w, h, zoom = 1) {
  const imgRatio = img.width / img.height;
  const rectRatio = w / h;

  let drawW = w * zoom;
  let drawH = h * zoom;
  if (imgRatio > rectRatio) {
    drawH = h * zoom;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * zoom;
    drawH = drawW / imgRatio;
  }

  const drawX = x + (w - drawW) / 2;
  const drawY = y + (h - drawH) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}

function drawLabelPill(ctx, text, width, opacity) {
  if (opacity <= 0) return;
  const paddingX = 22;
  const paddingY = 10;
  ctx.font = "700 28px Inter, sans-serif";
  const textWidth = ctx.measureText(text).width;
  const pillW = textWidth + paddingX * 2;
  const pillH = 28 + paddingY * 2;
  const x = 28;
  const y = 28;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "rgba(8,9,11,0.72)";
  roundRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = "#14b8a6";
  ctx.fillText(text, x + paddingX, y + pillH / 2 + 10);
  ctx.restore();
}

function drawCaptionBar(ctx, text, width, height) {
  if (!text) return;
  ctx.save();
  const barH = 90;
  const gradient = ctx.createLinearGradient(0, height - barH, 0, height);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.75)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height - barH, width, barH);

  ctx.font = "600 26px Inter, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(text, width / 2, height - 34, width - 64);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Renders one frame for time `t` (seconds, 0..TOTAL_SECONDS) into ctx.
export function renderFrame(ctx, { beforeImg, afterImg, width, height, t, transitionType, captionBottom }) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#08090b";
  ctx.fillRect(0, 0, width, height);

  const tBeforeEnd = TIMING.before;
  const tTransitionEnd = TIMING.before + TIMING.transition;

  let beforeLabelOpacity = 0;
  let afterLabelOpacity = 0;

  if (t < tBeforeEnd) {
    const zoom = 1 + 0.05 * (t / TIMING.before);
    drawImageCover(ctx, beforeImg, 0, 0, width, height, zoom);
    beforeLabelOpacity = 1;
  } else if (t < tTransitionEnd) {
    const p = easeInOut((t - tBeforeEnd) / TIMING.transition);
    const zoomBefore = 1.05;
    const zoomAfter = 1;

    if (transitionType === "wipe") {
      drawImageCover(ctx, beforeImg, 0, 0, width, height, zoomBefore);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width * p, height);
      ctx.clip();
      drawImageCover(ctx, afterImg, 0, 0, width, height, zoomAfter);
      ctx.restore();
    } else {
      drawImageCover(ctx, beforeImg, 0, 0, width, height, zoomBefore);
      ctx.save();
      ctx.globalAlpha = p;
      drawImageCover(ctx, afterImg, 0, 0, width, height, zoomAfter);
      ctx.restore();
    }
    beforeLabelOpacity = 1 - p;
    afterLabelOpacity = p;
  } else {
    const localT = t - tTransitionEnd;
    const zoom = 1 + 0.05 * (localT / TIMING.after);
    drawImageCover(ctx, afterImg, 0, 0, width, height, zoom);
    afterLabelOpacity = 1;
  }

  drawLabelPill(ctx, "BEFORE", width, beforeLabelOpacity);
  drawLabelPill(ctx, "AFTER", width, afterLabelOpacity);
  drawCaptionBar(ctx, captionBottom, width, height);
}

function pickMimeType() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || "video/webm";
}

// Plays the full before -> transition -> after sequence on `canvas` once,
// recording it into a downloadable Blob. Resolves with { blob, url }.
export function recordVideo({ canvas, beforeImg, afterImg, transitionType, captionBottom, fps = 30, onProgress }) {
  return new Promise((resolve, reject) => {
    if (!window.MediaRecorder) {
      reject(new Error("This browser doesn't support recording video (MediaRecorder API missing). Try Chrome or Edge."));
      return;
    }

    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const mimeType = pickMimeType();
    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (e) => reject(e.error || new Error("Recording failed"));
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve({ blob, url: URL.createObjectURL(blob) });
    };

    const startTime = performance.now();
    recorder.start();

    function tick() {
      const t = (performance.now() - startTime) / 1000;
      if (t >= TOTAL_SECONDS) {
        renderFrame(ctx, { beforeImg, afterImg, width, height, t: TOTAL_SECONDS - 0.001, transitionType, captionBottom });
        recorder.stop();
        return;
      }
      renderFrame(ctx, { beforeImg, afterImg, width, height, t, transitionType, captionBottom });
      onProgress?.(t / TOTAL_SECONDS);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
