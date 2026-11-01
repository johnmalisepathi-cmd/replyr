import { useEffect, useRef, useState } from "react";
import { COLORS, drawMandala, drawRipple } from "../lib/mandala.js";

// Hero artwork: information sources at the top stream into the VaradIQ
// mandala. It loops through the agent's day: watching (blue), thinking (spins
// faster, data flows in) and done (turns gold, ripples of light go out).
// Canvas draws the moving parts; the labels are HTML so they stay sharp.
const SOURCES = [
  { x: 0.12, label: "Flight prices", short: "Flights" },
  { x: 0.37, label: "Property listings", short: "Homes" },
  { x: 0.63, label: "Your bills", short: "Bills" },
  { x: 0.88, label: "Restaurant reviews", short: "Food" },
];
const OUTPUTS = [
  { big: "−22%", label: "Bali flights", tone: "text-brand-300" },
  { big: "$990", label: "Bills cut / yr", tone: "text-amber-300" },
  { big: "4 of 6", label: "Bali steps done", tone: "text-sky-300" },
];
const SRC_Y = 0.1;
const CORE_Y = 0.47;
const CYCLE = 14; // seconds: watching 0-4, thinking 4-9, done 9-14
const PHASES = [
  [0, "Watching for you"],
  [4, "Thinking…"],
  [9, "Done ✓"],
];

const clamp = (x) => Math.max(0, Math.min(1, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));

function bezier(a, c, b, t) {
  const u = 1 - t;
  return u * u * a + 2 * u * t * c + t * t * b;
}

export default function AICore() {
  const ref = useRef(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let shown = 0;

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

    const draw = (seconds) => {
      const t = seconds % CYCLE;
      const think = prog(t, 4, 4.8) * (1 - prog(t, 8.7, 9.3));
      const gold = prog(t, 9, 10) * (1 - prog(t, 13.2, 14));
      const cx = w / 2;
      const cy = h * CORE_Y;
      const R = Math.min(w, h) * 0.16;
      ctx.clearRect(0, 0, w, h);

      // Lanes from each source into the mandala
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(34,211,238,0.16)";
      for (const s of SOURCES) {
        ctx.beginPath();
        ctx.moveTo(s.x * w, h * SRC_Y);
        ctx.quadraticCurveTo(s.x * w, h * 0.3, cx, cy - R);
        ctx.stroke();
      }
      // Data flowing in: gentle while watching, a stream while thinking
      const flow = 0.25 + think * 0.75;
      SOURCES.forEach((s, i) => {
        for (let k = 0; k < 4; k++) {
          const u = (seconds * (0.18 + think * 0.35) + k / 4 + i * 0.13) % 1;
          ctx.fillStyle = `rgba(${i % 2 ? COLORS.GREEN : COLORS.CYAN},${flow * Math.sin(u * Math.PI)})`;
          ctx.beginPath();
          ctx.arc(bezier(s.x * w, s.x * w, cx, u), bezier(h * SRC_Y, h * 0.3, cy - R, u), 1.8 + think, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Ripples: soft blue ones while watching, gold bursts when done
      const sp = R * 0.9;
      [0.4, 2.2].forEach((b) => drawRipple(ctx, cx, cy, R * 1.1, t, b, { colour: COLORS.CYAN, count: 60, speed: sp, life: 2.6, size: 1.6 }));
      [9.2, 9.9, 10.8, 12].forEach((b, i) => drawRipple(ctx, cx, cy, R * 1.1, t, b, { colour: i % 2 ? COLORS.CREAM : COLORS.GOLD, count: 90, speed: sp * 1.5, life: 3, size: 2.2 }));

      const spin = still ? 0.2 : seconds * 0.12 + Math.min(Math.max(t - 4, 0), 5) * 0.4;
      drawMandala(ctx, cx, cy, R, { n: 8, spin, gold, energy: think, t: seconds, lw: Math.max(3, R * 0.06), glow: 0.8 + think * 0.5 + gold * 0.6 });

      const p = t >= 9 ? 2 : t >= 4 ? 1 : 0;
      if (p !== shown) {
        shown = p;
        setPhase(p);
      }
    };

    const loop = (time) => {
      if (visible) draw(time / 1000);
      raf = requestAnimationFrame(loop);
    };
    if (still) draw(1);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div className="w-full max-w-full" role="img" aria-label="AI engine diagram: prices, listings and your bills flow into the VaradIQ agent, which turns gold when a goal is done">
      <div className="relative aspect-[5/4] w-full">
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
        <span
          className={`absolute left-1/2 top-[76%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-700 sm:text-xs ${phase === 2 ? "text-amber-300" : "text-ai-cyan"}`}
          aria-live="off"
        >
          {PHASES[phase][1]}
        </span>
      </div>
      {/* Results sit in a grid so they never run off the edge on phones */}
      <div className="-mt-2 grid grid-cols-3 gap-2 sm:gap-3">
        {OUTPUTS.map((o) => (
          <span
            key={o.label}
            className={`rounded-xl border bg-navy-950/85 px-2 py-1.5 text-center transition-all duration-700 ${phase === 2 ? "border-amber-300/50 shadow-[0_0_30px_-8px_rgba(251,191,36,0.6)]" : "border-brand-400/30 shadow-glow"}`}
          >
            <span className={`block text-sm font-extrabold sm:text-base ${o.tone}`}>{o.big}</span>
            <span className="block text-[10px] leading-tight text-slate-400 sm:text-[11px]">{o.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
