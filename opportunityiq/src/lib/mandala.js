// The VaradIQ mandala: 8 V's in a circle, all pointing to a glowing core.
// Blue-green while it works, gold when a goal is done. This file draws it on
// a canvas (for animation); components/Mandala.jsx draws the same shape as SVG.

const BLUE = [59, 130, 246], CYAN = [34, 211, 238], GREEN = [139, 195, 74];
const GOLD = [251, 191, 36], AMBER = [245, 158, 11], CREAM = [253, 230, 138];

const lerp = (a, b, k) => a + (b - a) * k;
export const mix = (a, b, k) => a.map((v, i) => Math.round(lerp(v, b[i], k)));
export const rgba = (c, a) => `rgba(${c.join(",")},${a})`;
export const COLORS = { BLUE, CYAN, GREEN, GOLD, AMBER, CREAM };

/** Geometry shared by the canvas and SVG versions. */
export function vPoints(cx, cy, R, k, n, spin = 0, breathe = 1) {
  const a = spin + (k / n) * Math.PI * 2;
  const spread = (Math.PI / n) * 0.74;
  const r0 = R * 0.42;
  return {
    tip: [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0],
    e1: [cx + Math.cos(a - spread) * R * breathe, cy + Math.sin(a - spread) * R * breathe],
    e2: [cx + Math.cos(a + spread) * R * breathe, cy + Math.sin(a + spread) * R * breathe],
    a,
  };
}

/**
 * Draws the mandala on a 2D canvas.
 * energy 0..1: how hard it's thinking (a wave of light runs round the V's).
 * gold 0..1: blue-green to gold.
 */
export function drawMandala(ctx, cx, cy, R, { n = 8, spin = 0, gold = 0, energy = 0, t = 0, lw = 2, glow = 1 } = {}) {
  const c1 = mix(BLUE, AMBER, gold), c2 = mix(CYAN, GOLD, gold), c3 = mix(GREEN, CREAM, gold);
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
  halo.addColorStop(0, rgba(c2, 0.32 * glow));
  halo.addColorStop(0.45, rgba(c1, 0.1 * glow));
  halo.addColorStop(1, rgba(c1, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(cx - R * 1.6, cy - R * 1.6, R * 3.2, R * 3.2);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let k = 0; k < n; k++) {
    const a = spin + (k / n) * Math.PI * 2;
    const wave = energy * Math.pow(0.5 + 0.5 * Math.cos(a - spin - t * 5), 6);
    const { tip, e1, e2 } = vPoints(cx, cy, R, k, n, spin, 1 + Math.sin(t * 1.6 + k * 0.3) * 0.015 + wave * 0.06);
    const g = ctx.createLinearGradient(tip[0], tip[1], (e1[0] + e2[0]) / 2, (e1[1] + e2[1]) / 2);
    g.addColorStop(0, rgba(mix(c1, [255, 255, 255], wave * 0.6), 1));
    g.addColorStop(0.55, rgba(c2, 1));
    g.addColorStop(1, rgba(c3, 0.95));
    ctx.strokeStyle = g;
    ctx.lineWidth = lw * (1 + wave * 0.6);
    ctx.shadowColor = rgba(c2, 0.9);
    ctx.shadowBlur = lw * (2 + wave * 6) * glow;
    ctx.beginPath();
    ctx.moveTo(...e1);
    ctx.lineTo(...tip);
    ctx.lineTo(...e2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = rgba(c2, 0.55);
  ctx.lineWidth = lw * 0.45;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2);
  ctx.stroke();
  const cr = R * 0.17;
  const core = ctx.createRadialGradient(cx - cr * 0.3, cy - cr * 0.35, 0, cx, cy, cr);
  core.addColorStop(0, "#ffffff");
  core.addColorStop(0.45, rgba(mix([165, 243, 252], CREAM, gold), 1));
  core.addColorStop(1, rgba(c1, 1));
  ctx.shadowColor = rgba(c2, 1);
  ctx.shadowBlur = R * 0.25 * glow * (1 + energy * 0.5 * (0.5 + 0.5 * Math.sin(t * 8)));
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, cr * (1 + energy * 0.1 * Math.sin(t * 8)), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A ring of tiny particles travelling outward and fading, born at time `born` (seconds). */
export function drawRipple(ctx, cx, cy, R, t, born, { count = 80, speed = 120, life = 2.6, colour = CYAN, size = 2 } = {}) {
  const age = t - born;
  if (age < 0 || age > life) return;
  const k = age / life;
  const rad = R + age * speed * (1 - k * 0.35);
  ctx.fillStyle = rgba(colour, (1 - k) * 0.9);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + born * 1.3;
    const j = 1 + Math.sin(i * 7.1 + born * 3) * 0.08;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * rad * j, cy + Math.sin(a) * rad * j, size * (1 - k * 0.7), 0, Math.PI * 2);
    ctx.fill();
  }
}
