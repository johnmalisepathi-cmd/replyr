import { useId } from "react";
import { vPoints } from "../lib/mandala.js";

// The VaradIQ mark as SVG: 8 V's round a glowing core. `gold` switches to the
// "goal done" colours; `spinning` makes it the thinking indicator.
export default function Mandala({ size = 32, gold = false, spinning = false, glow = true, className = "" }) {
  const id = useId().replace(/:/g, "");
  const stops = gold ? ["#f59e0b", "#fbbf24", "#fde68a"] : ["#3b82f6", "#22d3ee", "#8bc34a"];
  const vs = Array.from({ length: 8 }, (_, k) => vPoints(32, 32, 24, k, 8, 0.2));
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={`${spinning ? "animate-mandala" : ""} ${className}`} aria-hidden="true">
      <defs>
        {vs.map(({ tip, e1, e2 }, k) => (
          <linearGradient key={k} id={`${id}v${k}`} gradientUnits="userSpaceOnUse" x1={tip[0]} y1={tip[1]} x2={(e1[0] + e2[0]) / 2} y2={(e1[1] + e2[1]) / 2}>
            <stop offset="0" stopColor={stops[0]} />
            <stop offset=".55" stopColor={stops[1]} />
            <stop offset="1" stopColor={stops[2]} />
          </linearGradient>
        ))}
        <radialGradient id={`${id}c`} cx=".38" cy=".35" r=".7">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".45" stopColor={gold ? "#fde68a" : "#a5f3fc"} />
          <stop offset="1" stopColor={stops[0]} />
        </radialGradient>
        <radialGradient id={`${id}h`}>
          <stop offset="0" stopColor={stops[1]} stopOpacity=".35" />
          <stop offset="1" stopColor={stops[1]} stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && <circle cx="32" cy="32" r="32" fill={`url(#${id}h)`} />}
      <circle cx="32" cy="32" r="26" fill="none" stroke={stops[1]} strokeOpacity=".55" strokeWidth="1.1" />
      {vs.map(({ tip, e1, e2 }, k) => (
        <polyline key={k} points={`${e1} ${tip} ${e2}`} fill="none" stroke={`url(#${id}v${k})`} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <circle cx="32" cy="32" r="4.4" fill={`url(#${id}c)`} className={spinning ? "animate-glow" : ""} />
    </svg>
  );
}
