import { useEffect, useRef } from "react";

// Hero artwork: information sources at the top stream into a pulsing AI
// core, which sends scored matches out to the bottom. Canvas draws the
// moving parts; the labels are HTML so they stay sharp and readable.
const SOURCES = [
  { x: 0.12, label: "Tender portals", short: "Tenders" },
  { x: 0.37, label: "Planning approvals", short: "Planning" },
  { x: 0.63, label: "Project pipelines", short: "Pipelines" },
  { x: 0.88, label: "Supplier pages", short: "Suppliers" },
];
const OUTPUTS = [
  { x: 0.18, score: 91, label: "Support frames" },
  { x: 0.5, score: 74, label: "Access platforms" },
  { x: 0.82, score: 38, label: "Car park steel" },
];
const SRC_Y = 0.12;
const CORE_Y = 0.5;
const OUT_Y = 0.86;

function bezier(a, c, b, t) {
  const u = 1 - t;
  return u * u * a + 2 * u * t * c + t * t * b;
}

export default function AICore() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // Particles: inbound (source -> core) and outbound (core -> match).
    const parts = Array.from({ length: 46 }, (_, i) => ({
      out: i % 3 === 0,
      lane: i,
      t: Math.random(),
      speed: 0.0022 + Math.random() * 0.0035,
    }));

    const path = (p) => {
      const cx = w / 2;
      const cy = h * CORE_Y;
      if (p.out) {
        const o = OUTPUTS[p.lane % OUTPUTS.length];
        return [cx, cy, o.x * w, h * 0.7, o.x * w, h * OUT_Y];
      }
      const s = SOURCES[p.lane % SOURCES.length];
      return [s.x * w, h * SRC_Y, s.x * w, h * 0.32, cx, cy];
    };

    const draw = (time) => {
      const cx = w / 2;
      const cy = h * CORE_Y;
      const R = Math.min(w, h) * 0.13;
      ctx.clearRect(0, 0, w, h);

      // Lanes
      ctx.lineWidth = 1;
      [...SOURCES.map((s) => [s.x * w, h * SRC_Y, s.x * w, h * 0.32, cx, cy]), ...OUTPUTS.map((o) => [cx, cy, o.x * w, h * 0.7, o.x * w, h * OUT_Y])].forEach(
        ([x0, y0, x1, y1, x2, y2], i) => {
          ctx.strokeStyle = i < SOURCES.length ? "rgba(34,211,238,0.16)" : "rgba(52,211,153,0.18)";
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo(x1, y1, x2, y2);
          ctx.stroke();
        }
      );

      // Particles
      for (const p of parts) {
        if (!still) p.t = (p.t + p.speed) % 1;
        const [x0, y0, x1, y1, x2, y2] = path(p);
        const x = bezier(x0, x1, x2, p.t);
        const y = bezier(y0, y1, y2, p.t);
        const fade = Math.sin(Math.PI * p.t);
        ctx.fillStyle = p.out ? `rgba(52,211,153,${0.9 * fade})` : `rgba(34,211,238,${0.9 * fade})`;
        ctx.beginPath();
        ctx.arc(x, y, p.out ? 2.4 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core glow
      const pulse = still ? 1 : 1 + Math.sin(time / 700) * 0.06;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.6 * pulse);
      g.addColorStop(0, "rgba(167,139,250,0.55)");
      g.addColorStop(0.35, "rgba(34,211,238,0.18)");
      g.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 2.6 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Orbit rings
      const spin = still ? 0 : time / 2400;
      [1.35, 1.75].forEach((k, i) => {
        ctx.strokeStyle = i ? "rgba(52,211,153,0.35)" : "rgba(167,139,250,0.55)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 7]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * k, R * k * 0.42, i ? -spin : spin, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Core
      const cg = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      cg.addColorStop(0, "#e0f2fe");
      cg.addColorStop(0.35, "#22d3ee");
      cg.addColorStop(0.75, "#7c3aed");
      cg.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, R * pulse * 0.9, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = (t) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };
    if (still) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className="relative aspect-[5/4] w-full max-w-full" aria-label="AI engine diagram: sources flow into the AI core, which outputs scored matches" role="img">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      {SOURCES.map((s) => (
        <span
          key={s.label}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-ai-cyan/30 bg-navy-950/80 px-2 py-1 text-[10px] font-medium text-cyan-100 sm:px-2.5 sm:text-xs"
          style={{ left: `${s.x * 100}%`, top: `${SRC_Y * 100}%` }}
        >
          <span className="sm:hidden">{s.short}</span>
          <span className="hidden sm:inline">{s.label}</span>
        </span>
      ))}
      <span className="absolute left-1/2 top-[66%] -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[0.2em] text-ai-violet sm:text-xs">
        AI engine
      </span>
      {OUTPUTS.map((o) => (
        <span
          key={o.label}
          className="absolute -translate-x-1/2 -translate-y-1/2 animate-floaty rounded-xl border border-brand-400/30 bg-navy-950/85 px-2.5 py-1.5 text-center shadow-glow"
          style={{ left: `${o.x * 100}%`, top: `${OUT_Y * 100}%`, animationDelay: `${o.x * 2}s` }}
        >
          <span className={`block text-sm font-extrabold sm:text-base ${o.score >= 75 ? "text-brand-300" : o.score >= 50 ? "text-amber-300" : "text-slate-400"}`}>{o.score}%</span>
          <span className="block whitespace-nowrap text-[10px] text-slate-400 sm:text-[11px]">{o.label}</span>
        </span>
      ))}
    </div>
  );
}
