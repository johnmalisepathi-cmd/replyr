// Builds a self-contained, dependency-free HTML snippet for the drag-to-
// compare slider, so a business can paste it straight into their own
// website (Wix/Squarespace "embed HTML" block, a plain <iframe>, etc).
// This is the thing a video export (CapCut, Canva, any editor) can't
// produce — an interactive widget for their own site, not a video file.

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildEmbedHtml({ beforeDataUrl, afterDataUrl, caption = "" }) {
  const safeCaption = escapeHtml(caption);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  .ba-slider { position: relative; width: 100%; max-width: 640px; aspect-ratio: 4 / 3; margin: 0 auto; overflow: hidden; border-radius: 14px; font-family: system-ui, -apple-system, sans-serif; touch-action: none; cursor: ew-resize; user-select: none; background: #111; }
  .ba-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .ba-before { clip-path: inset(0 50% 0 0); }
  .ba-handle { position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; background: rgba(255,255,255,.85); transform: translateX(-50%); }
  .ba-handle::after { content: ""; position: absolute; top: 50%; left: 50%; width: 38px; height: 38px; background: #fff; border-radius: 50%; transform: translate(-50%,-50%); box-shadow: 0 4px 14px rgba(0,0,0,.35); }
  .ba-label { position: absolute; top: 12px; font: 700 12px/1 system-ui, sans-serif; color: #fff; background: rgba(0,0,0,.6); padding: 6px 10px; border-radius: 999px; letter-spacing: .03em; }
  .ba-caption { text-align: center; font: 600 14px system-ui, sans-serif; color: #222; margin-top: 10px; }
</style>
</head>
<body>
<div class="ba-slider" id="baSlider">
  <img class="ba-img" src="${afterDataUrl}" alt="After" />
  <img class="ba-img ba-before" id="baBefore" src="${beforeDataUrl}" alt="Before" />
  <span class="ba-label" style="left:12px">BEFORE</span>
  <span class="ba-label" style="right:12px">AFTER</span>
  <div class="ba-handle" id="baHandle"></div>
</div>
${safeCaption ? `<div class="ba-caption">${safeCaption}</div>` : ""}
<script>
(function () {
  var slider = document.getElementById('baSlider');
  var before = document.getElementById('baBefore');
  var handle = document.getElementById('baHandle');
  var dragging = false;
  function setPos(clientX) {
    var rect = slider.getBoundingClientRect();
    var pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    before.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    handle.style.left = pct + '%';
  }
  slider.addEventListener('mousedown', function (e) { dragging = true; setPos(e.clientX); });
  slider.addEventListener('touchstart', function (e) { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mousemove', function (e) { if (dragging) setPos(e.clientX); });
  window.addEventListener('touchmove', function (e) { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('mouseup', function () { dragging = false; });
  window.addEventListener('touchend', function () { dragging = false; });
})();
</script>
</body>
</html>
`;
}
