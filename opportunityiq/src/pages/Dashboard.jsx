import { useMemo, useState } from "react";
import { go } from "../lib/router.js";
import { OPPORTUNITIES } from "../lib/data.js";
import { daysUntil, formatMoney, scoreOpportunity, searchOpportunities } from "../lib/match.js";
import { FitBadge, FitBar, KindBadge } from "../components/ui.jsx";

const EXAMPLES = ["6 mm to 20 mm steel plate cutting within 250 km of Perth", "welding within 50 km", "design consulting"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Dashboard({ profile, pipeline }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [minFit, setMinFit] = useState(0);

  const scored = useMemo(
    () => OPPORTUNITIES.map((op) => ({ op, ...scoreOpportunity(op, profile) })).sort((a, b) => b.score - a.score),
    [profile]
  );

  const visible = useMemo(() => {
    const ids = new Set(searchOpportunities(OPPORTUNITIES, query).map((o) => o.id));
    return scored.filter((s) => ids.has(s.op.id) && (kind === "all" || s.op.kind === kind) && s.score >= minFit);
  }, [scored, query, kind, minFit]);

  const good = scored.filter((s) => s.score >= 75);
  const toReview = scored.filter((s) => s.score >= 50 && !pipeline[s.op.id]);
  const top = scored[0];

  return (
    <main className="section py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your business intelligence</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        {greeting()}{profile.companyName ? `, ${profile.companyName}` : ""}. Here's what matters to your business.
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          [OPPORTUNITIES.length, "Discovered"],
          [good.length, "High-fit matches"],
          [toReview.length, "To review"],
        ].map(([n, l]) => (
          <div key={l} className="card p-4 text-center">
            <p className="text-3xl font-extrabold">{n}</p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">{l}</p>
          </div>
        ))}
      </div>

      {top && (
        <button onClick={() => go(`/opportunity/${top.op.id}`)} className="card mt-6 block w-full p-5 text-left transition hover:border-brand-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Recommended opportunity</p>
            <FitBadge score={top.score} />
          </div>
          <p className="mt-2 text-lg font-semibold">{top.op.title}</p>
          <p className="text-sm text-slate-500">{top.op.buyer} · {top.op.location} · Sample data</p>
          <p className="mt-3 text-sm">✨ {top.reasons[0] || "Partial match"}{top.gaps[0] ? `. ${top.gaps[0]}.` : "."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {top.matched.map((m) => <span key={m} className="chip">{m}</span>)}
          </div>
        </button>
      )}

      <div className="mt-6 rounded-2xl bg-navy-900 p-5 text-white">
        <label htmlFor="ask" className="flex items-center gap-2 font-semibold">🤖 Ask OpportunityIQ</label>
        <input
          id="ask"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Show projects that need 6 mm to 20 mm steel plate cutting within 250 km of Perth"
          className="mt-3 w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button key={e} onClick={() => setQuery(e)} className="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20">
              {e}
            </button>
          ))}
          {query && <button onClick={() => setQuery("")} className="rounded-full px-3 py-1 text-xs text-brand-300">Clear</button>}
        </div>
        <p className="mt-2 text-xs text-slate-400">Demo search uses keywords and distance. The launched version will answer from verified tender documents.</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{visible.length} opportunities</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {[["all", "All"], ["tender", "Formal tenders"], ["signal", "Early signals"]].map(([k, l]) => (
            <button key={k} onClick={() => setKind(k)} className={`rounded-full px-3 py-1.5 ${kind === k ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
              {l}
            </button>
          ))}
          <select value={minFit} onChange={(e) => setMinFit(Number(e.target.value))} className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200" aria-label="Minimum fit">
            <option value={0}>Any fit</option>
            <option value={50}>50%+ fit</option>
            <option value={75}>75%+ fit</option>
          </select>
        </div>
      </div>

      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {visible.map(({ op, score, reasons, gaps }) => {
          const days = daysUntil(op.deadline);
          return (
            <li key={op.id}>
              <button onClick={() => go(`/opportunity/${op.id}`)} className="card flex h-full w-full flex-col p-5 text-left transition hover:-translate-y-0.5 hover:border-brand-300">
                <div className="flex flex-wrap items-center gap-2">
                  <KindBadge kind={op.kind} />
                  {pipeline[op.id] && <span className="chip bg-brand-50 text-brand-700">{pipeline[op.id]}</span>}
                </div>
                <p className="mt-3 font-semibold leading-snug">{op.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {op.location} · est. {formatMoney(op.value)} · {days === null ? "No deadline yet" : `Closes in ${days} days`}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <FitBar score={score} />
                  <span className="w-12 shrink-0 text-right text-sm font-bold">{score}%</span>
                </div>
                <p className="mt-2 text-xs text-slate-600">{gaps[0] ? `⚠ ${gaps[0]}` : `✓ ${reasons[0]}`}</p>
              </button>
            </li>
          );
        })}
      </ul>
      {!visible.length && <p className="card mt-4 p-8 text-center text-slate-500">No matches for those filters. Try clearing the search.</p>}
    </main>
  );
}
