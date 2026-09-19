// All video generation happens client-side: draw frames to a <canvas>,
// capture the canvas as a MediaStream, and record it with MediaRecorder.
// No server, no upload of the customer's photos anywhere.

// Per-pair hold/transition durations. A single pair gets a slower, more
// cinematic pace; multiple pairs use a snappier pace so a 4-5 pair video
// doesn't run half a minute long.
const TIMING_SINGLE = { before: 2.0, transition: 0.6, after: 2.6 };
const TIMING_MULTI = { before: 1.0, transition: 0.4, after: 1.2 };

export const MAX_PAIRS = 6;

export function getTiming(pairCount) {
  return pairCount <= 1 ? TIMING_SINGLE : TIMING_MULTI;
}

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Builds a flat timeline from an ordered list of { beforeImg, afterImg }
// pairs, so a single time value `t` can look up which pair is active and
// how far into its before/transition/after phases it is.
export function buildTimeline(pairs) {
  const timing = getTiming(pairs.length);
  const pairDuration = timing.before + timing.transition + timing.after;
  const segments = pairs.map((pair, i) => ({
    ...pair,
    tStart: i * pairDuration,
    tBeforeEnd: i * pairDuration + timing.before,
    tTransitionEnd: i * pairDuration + timing.before + timing.transition,
    tEnd: (i + 1) * pairDuration,
  }));
  return { segments, timing, totalSeconds: segments.length * pairDuration };
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

function drawLabelPill(ctx, text, opacity) {
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

function drawPairCounter(ctx, index, total, width) {
  if (total <= 1) return;
  const text = `${index + 1} / ${total}`;
  ctx.save();
  ctx.font = "600 20px Inter, sans-serif";
  const textWidth = ctx.measureText(text).width;
  const paddingX = 14;
  const pillW = textWidth + paddingX * 2;
  const pillH = 34;
  const x = width - pillW - 24;
  const y = 28;
  ctx.fillStyle = "rgba(8,9,11,0.72)";
  roundRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(text, x + paddingX, y + pillH / 2 + 7);
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

function findSegment(segments, t) {
  return segments.find((s) => t < s.tEnd) || segments[segments.length - 1];
}

// Renders one frame for time `t` (seconds, 0..totalSeconds) into ctx, given
// a timeline built by buildTimeline().
export function renderFrame(ctx, { segments, timing, width, height, t, transitionType, captionBottom }) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#08090b";
  ctx.fillRect(0, 0, width, height);

  const segment = findSegment(segments, t);
  const segIndex = segments.indexOf(segment);
  const localT = Math.min(t - segment.tStart, timing.before + timing.transition + timing.after);
  const { beforeImg, afterImg } = segment;

  let beforeLabelOpacity = 0;
  let afterLabelOpacity = 0;

  if (localT < timing.before) {
    const zoom = 1 + 0.05 * (localT / timing.before);
    drawImageCover(ctx, beforeImg, 0, 0, width, height, zoom);
    beforeLabelOpacity = 1;
  } else if (localT < timing.before + timing.transition) {
    const p = easeInOut((localT - timing.before) / timing.transition);
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
    const afterLocalT = localT - timing.before - timing.transition;
    const zoom = 1 + 0.05 * (afterLocalT / timing.after);
    drawImageCover(ctx, afterImg, 0, 0, width, height, zoom);
    afterLabelOpacity = 1;
  }

  drawLabelPill(ctx, "BEFORE", beforeLabelOpacity);
  drawLabelPill(ctx, "AFTER", afterLabelOpacity);
  drawPairCounter(ctx, segIndex, segments.length, width);
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

// Plays the full timeline (one or more before -> transition -> after
// segments) on `canvas` once, recording it into a downloadable Blob.
// Resolves with { blob, url }.
export function recordVideo({ canvas, pairs, transitionType, captionBottom, fps = 30, onProgress }) {
  return new Promise((resolve, reject) => {
    if (!window.MediaRecorder) {
      reject(new Error("This browser doesn't support recording video (MediaRecorder API missing). Try Chrome or Edge."));
      return;
    }
    if (!pairs.length) {
      reject(new Error("Add at least one before/after pair first."));
      return;
    }

    const { segments, timing, totalSeconds } = buildTimeline(pairs);
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
      if (t >= totalSeconds) {
        renderFrame(ctx, { segments, timing, width, height, t: totalSeconds - 0.001, transitionType, captionBottom });
        recorder.stop();
        return;
      }
      renderFrame(ctx, { segments, timing, width, height, t, transitionType, captionBottom });
      onProgress?.(t / totalSeconds);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
