import { useState } from "react";

const PLUS_PER_YEAR = 9.99 * 12;
const money = (n) => `$${Math.round(n).toLocaleString("en-AU")}`;

// Assumptions, shown to the visitor: booking travel at the right time saves
// ~12%, buying tech in a sale saves ~10%, a better home-loan rate saves
// 0.25% a year on the balance.
const FIELDS = [
  { id: "trip", label: "Holidays you book a year (total spend)", min: 0, max: 20000, step: 500, fmt: (v) => money(v) },
  { id: "tech", label: "Big purchases a year (phones, laptops, TVs)", min: 0, max: 10000, step: 250, fmt: (v) => money(v) },
  { id: "loan", label: "Home loan you have or plan", min: 0, max: 1500000, step: 25000, fmt: (v) => money(v) },
  { id: "hours", label: "Hours a week you spend researching", min: 0, max: 10, step: 0.5, fmt: (v) => `${v} h` },
];

export default function RoiCalculator() {
  const [v, setV] = useState({ trip: 4000, tech: 1500, loan: 600000, hours: 3 });

  const travel = v.trip * 0.12;
  const gadgets = v.tech * 0.1;
  const rate = v.loan * 0.0025;
  const hoursSaved = Math.max(0, v.hours - 0.25) * 52;
  const total = travel + gadgets + rate;
  const multiple = total / PLUS_PER_YEAR;

  return (
    <div className="ai-panel grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="min-w-0 space-y-5">
        {FIELDS.map((f) => (
          <div key={f.id}>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={`roi-${f.id}`} className="text-sm text-slate-300">{f.label}</label>
              <span className="text-sm font-bold tabular-nums text-white">{f.fmt(v[f.id])}</span>
            </div>
            <input
              id={`roi-${f.id}`}
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={v[f.id]}
              onChange={(e) => setV((x) => ({ ...x, [f.id]: Number(e.target.value) }))}
              className="mt-2 w-full accent-cyan-400"
            />
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-white/10 bg-black/30 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ai-cyan">You could save per year</p>
        <p className="mt-2 text-5xl font-extrabold tabular-nums text-white">{money(total)}</p>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-slate-400">Booking travel at the right time</dt><dd className="tabular-nums text-slate-100">{money(travel)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-400">Buying in the right sale</dt><dd className="tabular-nums text-slate-100">{money(gadgets)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-400">A 0.25% better home-loan rate</dt><dd className="tabular-nums text-slate-100">{money(rate)}</dd></div>
          <div className="flex justify-between gap-3 border-t border-white/10 pt-2"><dt className="text-slate-400">Plus plan cost</dt><dd className="tabular-nums text-slate-100">−{money(PLUS_PER_YEAR)}</dd></div>
        </dl>
        <p className="mt-5 rounded-xl bg-brand-500/15 px-4 py-3 text-center font-semibold text-brand-200">
          {multiple >= 1 ? `About ${multiple >= 10 ? Math.round(multiple) : multiple.toFixed(1)}× what it costs, plus ${Math.round(hoursSaved)} hours back` : "Mostly time saved. Try the free plan first."}
        </p>
        <p className="mt-3 text-xs text-slate-500">Your own estimate, using typical savings (12% on travel, 10% on tech, 0.25% on a loan). Not financial advice.</p>
      </div>
    </div>
  );
}
