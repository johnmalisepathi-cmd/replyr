import { useState } from "react";

const PRO_PER_YEAR = 99 * 12;
const WEEKS_PER_MONTH = 52 / 12;

const money = (n) => `$${Math.round(n).toLocaleString("en-AU")}`;

const FIELDS = [
  { id: "hours", label: "Hours a week you spend finding work", min: 0, max: 15, step: 0.5, fmt: (v) => `${v} h` },
  { id: "rate", label: "What an hour of your time is worth", min: 40, max: 200, step: 5, fmt: (v) => `$${v}` },
  { id: "job", label: "Typical job value", min: 10_000, max: 500_000, step: 5_000, fmt: (v) => money(v) },
  { id: "margin", label: "Your profit margin", min: 5, max: 40, step: 1, fmt: (v) => `${v}%` },
  { id: "jobs", label: "Extra jobs won a year", min: 0, max: 6, step: 1, fmt: (v) => `${v}` },
];

export default function RoiCalculator() {
  const [v, setV] = useState({ hours: 4, rate: 80, job: 60_000, margin: 15, jobs: 1 });

  // Assume OpportunityIQ cuts search time to about 15 minutes a week.
  const hoursSaved = Math.max(0, v.hours - 0.25);
  const timeValueYear = hoursSaved * WEEKS_PER_MONTH * 12 * v.rate;
  const profitYear = v.job * (v.margin / 100) * v.jobs;
  const totalYear = timeValueYear + profitYear;
  const multiple = totalYear / PRO_PER_YEAR;

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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ai-cyan">Your estimated value per year</p>
        <p className="mt-2 text-5xl font-extrabold tabular-nums text-white">{money(totalYear)}</p>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">Time saved ({Math.round(hoursSaved * 52)} h)</dt>
            <dd className="tabular-nums text-slate-100">{money(timeValueYear)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">Profit from extra jobs</dt>
            <dd className="tabular-nums text-slate-100">{money(profitYear)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-white/10 pt-2">
            <dt className="text-slate-400">Pro plan cost</dt>
            <dd className="tabular-nums text-slate-100">−{money(PRO_PER_YEAR)}</dd>
          </div>
        </dl>
        <p className="mt-5 rounded-xl bg-brand-500/15 px-4 py-3 text-center font-semibold text-brand-200">
          {multiple >= 1 ? `About ${multiple >= 10 ? Math.round(multiple) : multiple.toFixed(1)}× what it costs` : "Less than the cost. It may not be for you yet."}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Your own estimate. It assumes search time drops to about 15 minutes a week. We can't guarantee you'll win work.
        </p>
      </div>
    </div>
  );
}
