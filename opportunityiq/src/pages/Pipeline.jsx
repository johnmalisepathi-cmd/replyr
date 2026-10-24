import { go } from "../lib/router.js";
import { PLAN_STAGES } from "../lib/goals.js";
import { findsFor } from "../lib/geo.js";
import { priceOf } from "../lib/match.js";

// The plan: everything the person saved, moving from saved to done.
export default function Pipeline({ profile, pipeline, setStage }) {
  const tracked = findsFor(profile).filter((s, i, all) => pipeline[s.op.id] && all.findIndex((x) => x.op.id === s.op.id) === i);

  return (
    <main className="section py-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My plan</h1>
      <p className="mt-1 text-slate-600">Everything you've saved, from first look to booked and done.</p>

      {!tracked.length ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-slate-600">Nothing saved yet. Open a goal and tap <strong>Saved</strong> on anything you like.</p>
          <button onClick={() => go("/dashboard")} className="btn-dark mt-4">See my finds</button>
        </div>
      ) : (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {PLAN_STAGES.map((stage, i) => {
            const items = tracked.filter((s) => pipeline[s.op.id] === stage);
            return (
              <section key={stage} className="w-64 shrink-0 rounded-2xl bg-slate-100 p-3 lg:w-auto lg:flex-1">
                <h2 className="mb-3 px-1 text-sm font-semibold">{stage} <span className="text-slate-400">{items.length}</span></h2>
                <ul className="space-y-2">
                  {items.map(({ op, goal }) => (
                    <li key={op.id} className="rounded-xl bg-white p-3 shadow-sm">
                      <button onClick={() => go(`/goal/${goal.id}`)} className="text-left text-sm font-medium leading-snug hover:text-brand-700">{op.title}</button>
                      <p className="mt-1 text-xs text-slate-500">{goal.title} · {priceOf(op)}</p>
                      <div className="mt-2 flex justify-between text-xs">
                        <button disabled={i === 0} onClick={() => setStage(op.id, PLAN_STAGES[i - 1])} className="text-slate-500 disabled:opacity-30">← Back</button>
                        <button disabled={i === PLAN_STAGES.length - 1} onClick={() => setStage(op.id, PLAN_STAGES[i + 1])} className="font-medium text-brand-600 disabled:opacity-30">Move →</button>
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
