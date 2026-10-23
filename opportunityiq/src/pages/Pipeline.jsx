import { go } from "../lib/router.js";
import { PIPELINE_STAGES } from "../lib/data.js";
import { opportunitiesFor } from "../lib/geo.js";
import { formatMoney, scoreOpportunity } from "../lib/match.js";

export default function Pipeline({ profile, pipeline, setStage }) {
  const tracked = opportunitiesFor(profile).filter((o) => pipeline[o.id]);
  const value = (stage) => tracked.filter((o) => pipeline[o.id] === stage).reduce((t, o) => t + o.value, 0);

  return (
    <main className="section py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pipeline</h1>
      <p className="mt-1 text-slate-600">Track every opportunity from first interest to won or lost.</p>

      {!tracked.length ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-slate-600">Nothing tracked yet. Open an opportunity and mark it as <strong>Interested</strong>.</p>
          <button onClick={() => go("/dashboard")} className="btn-dark mt-4">Browse opportunities</button>
        </div>
      ) : (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage, i) => {
            const items = tracked.filter((o) => pipeline[o.id] === stage);
            return (
              <section key={stage} className="w-60 shrink-0 rounded-2xl lg:w-auto lg:flex-1 bg-slate-100 p-3">
                <div className="mb-3 flex items-baseline justify-between px-1">
                  <h2 className="text-sm font-semibold">{stage} <span className="text-slate-400">{items.length}</span></h2>
                  <span className="text-xs text-slate-500">{items.length ? formatMoney(value(stage)) : ""}</span>
                </div>
                <ul className="space-y-2">
                  {items.map((o) => (
                    <li key={o.id} className="rounded-xl bg-white p-3 shadow-sm">
                      <button onClick={() => go(`/opportunity/${o.id}`)} className="text-left text-sm font-medium leading-snug hover:text-brand-700">
                        {o.title}
                      </button>
                      <p className="mt-1 text-xs text-slate-500">{formatMoney(o.value)} · {scoreOpportunity(o, profile).score}% fit</p>
                      <div className="mt-2 flex justify-between text-xs">
                        <button disabled={i === 0} onClick={() => setStage(o.id, PIPELINE_STAGES[i - 1])} className="text-slate-500 disabled:opacity-30">← Back</button>
                        <button disabled={i === PIPELINE_STAGES.length - 1} onClick={() => setStage(o.id, PIPELINE_STAGES[i + 1])} className="font-medium text-brand-600 disabled:opacity-30">Move →</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
