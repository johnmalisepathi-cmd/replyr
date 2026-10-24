import { useEffect, useMemo, useRef, useState } from "react";
import { go } from "../lib/router.js";
import { GOAL_TYPES, PLAN_STAGES } from "../lib/goals.js";
import { findsFor, homeOf } from "../lib/geo.js";
import { formatMoney, monthlyRepayment, priceOf } from "../lib/match.js";
import { advicePrompt, aiErrorText, useAI } from "../lib/ai.js";
import { FitBadge, FitBar } from "../components/ui.jsx";
import WorldMap from "../components/WorldMap.jsx";
import { AIBadge, AIText, AIThinking, IndustryIcon, Sparkle } from "../components/ai-ui.jsx";
import { boundsOf, countdown } from "./Dashboard.jsx";

// Home goals: what the (sample) interest rate means for repayments.
function RepaymentCalc({ budget }) {
  const [price, setPrice] = useState(budget || 700000);
  const [deposit, setDeposit] = useState(Math.round((budget || 700000) * 0.1 / 5000) * 5000);
  const [rate, setRate] = useState(6.1);
  const loan = Math.max(0, price - deposit);
  const pay = monthlyRepayment(loan, rate);
  const buffer = monthlyRepayment(loan, rate + 3);
  const fields = [
    ["rc-price", "Home price", price, setPrice, 200000, 2000000, 5000, formatMoney(price)],
    ["rc-dep", "Deposit", deposit, setDeposit, 0, price * 0.5, 5000, `${formatMoney(deposit)} (${Math.round((deposit / price) * 100)}%)`],
    ["rc-rate", "Interest rate (sample)", rate, setRate, 3, 9, 0.05, `${rate.toFixed(2)}%`],
  ];
  return (
    <div className="card p-5">
      <p className="font-semibold">What interest rates mean for you</p>
      <div className="mt-4 space-y-4">
        {fields.map(([id, label, v, set, min, max, step, shown]) => (
          <div key={id}>
            <div className="flex justify-between text-sm"><label htmlFor={id} className="text-slate-600">{label}</label><span className="font-semibold tabular-nums">{shown}</span></div>
            <input id={id} type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} className="mt-1 w-full accent-emerald-600" />
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Monthly repayment</p><p className="text-xl font-extrabold tabular-nums">{formatMoney(pay)}</p></div>
        <div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-800">If rates rise 3%</p><p className="text-xl font-extrabold tabular-nums text-amber-900">{formatMoney(buffer)}</p></div>
      </div>
      <p className="mt-3 text-xs text-slate-500">30-year principal-and-interest loan of {formatMoney(loan)}. General information only, not financial advice. Lenders usually test you at about 3% above the rate.</p>
    </div>
  );
}

export default function Goal({ id, profile, pipeline, setStage }) {
  const goal = profile.goals.find((g) => g.id === id);
  const ai = useAI();
  const [advice, setAdvice] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const ctl = useRef(null);
  useEffect(() => () => ctl.current?.abort(), []);
  const finds = useMemo(() => findsFor(profile).filter((s) => s.goal.id === id), [profile, id]);

  if (!goal) {
    return (
      <main className="section py-16 text-center">
        <p className="text-slate-600">That goal wasn't found.</p>
        <button className="btn-dark mt-4" onClick={() => go("/dashboard")}>Back to dashboard</button>
      </main>
    );
  }

  const getAdvice = async () => {
    ctl.current?.abort();
    ctl.current = new AbortController();
    setBusy(true);
    setNote("");
    setAdvice("");
    try {
      await ai.text(advicePrompt(goal, finds), { signal: ctl.current.signal, onText: ({ text }) => setAdvice(text) });
    } catch (e) {
      setNote(aiErrorText(e));
    }
    setBusy(false);
  };

  return (
    <main className="section py-8">
      <button onClick={() => go("/dashboard")} className="text-sm text-slate-500 hover:text-slate-900">← Dashboard</button>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-ai-cyan">
          <IndustryIcon id={goal.type} className="h-8 w-8" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{GOAL_TYPES[goal.type].label}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{goal.title}</h1>
          {goal.wish && <p className="mt-1 text-slate-600">"{goal.wish}"</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="card p-3"><p className="text-xs text-slate-500">Budget</p><p className="font-bold">{goal.budget ? formatMoney(goal.budget) : "Not set"}</p></div>
        <div className="card p-3"><p className="text-xs text-slate-500">When</p><p className="font-bold">{countdown(goal.when)}</p></div>
        <div className="card p-3"><p className="text-xs text-slate-500">Where</p><p className="truncate font-bold">{goal.location}</p></div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="ai-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-semibold text-white"><Sparkle className="h-5 w-5 text-ai-cyan" /> AI advice for this goal</p>
              <AIBadge live={!!ai} />
            </div>
            {!advice && !busy && (
              <>
                <p className="mt-2 text-sm text-slate-400">The AI weighs every find against your budget, timing and wishes, and tells you what to do next.</p>
                <button disabled={!ai} onClick={getAdvice} className="btn-ai mt-4"><Sparkle /> {ai ? "Get my advice" : "AI not connected in this view"}</button>
              </>
            )}
            {busy && !advice && <div className="mt-4"><AIThinking label="Comparing every option for you" /></div>}
            {advice && <div className="mt-4"><AIText text={advice} streaming={busy} /></div>}
            {!busy && advice && <button onClick={getAdvice} className="mt-3 text-xs font-medium text-ai-cyan hover:text-white">Ask again</button>}
            {note && <p className="mt-3 text-xs text-amber-300">{note}</p>}
          </div>

          <WorldMap items={finds} home={homeOf(profile)} initialView={boundsOf(finds)} onOpen={(op) => document.getElementById(`find-${op.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} title={`${goal.title}: on the map`} />

          <ul className="space-y-4">
            {finds.map(({ op, score, reasons, gaps }) => (
              <li key={op.id} id={`find-${op.id}`} className="card scroll-mt-24 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${op.kind === "watch" ? "border border-dashed border-violet-400 bg-violet-50 text-violet-700" : "bg-navy-900 text-white"}`}>
                    {op.kind === "watch" ? "Tracking for you" : "Available now"}
                  </span>
                  {op.kind === "option" && <FitBadge score={score} />}
                </div>
                <p className="mt-3 text-lg font-semibold leading-snug">{op.title}</p>
                <p className="text-sm text-slate-500">{[op.location, priceOf(op), op.rating ? `${op.rating} ★` : null, op.tag].filter(Boolean).join(" · ")}</p>
                {op.kind === "option" && <div className="mt-3"><FitBar score={score} /></div>}
                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {Object.entries(op.facts).map(([k, v]) => (
                    <div key={k} className="flex gap-2"><dt className="shrink-0 text-slate-500">{k}:</dt><dd className="font-medium">{v}</dd></div>
                  ))}
                </dl>
                {(reasons.length > 0 || gaps.length > 0) && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {reasons.slice(0, 2).map((r) => <li key={r} className="text-brand-700">✓ {r}</li>)}
                    {gaps.slice(0, 1).map((g) => <li key={g} className="text-amber-700">⚠ {g}</li>)}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {PLAN_STAGES.map((st) => (
                    <button key={st} onClick={() => setStage(op.id, pipeline[op.id] === st ? null : st)} className={`rounded-full px-3 py-1.5 text-sm ${pipeline[op.id] === st ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                      {st}
                    </button>
                  ))}
                </div>
              </li>
            ))}
            {!finds.length && <li className="card p-8 text-center text-slate-500">I'm watching for this. Nothing new yet.</li>}
          </ul>
        </div>

        <aside className="space-y-4">
          {goal.type === "home" && <RepaymentCalc budget={goal.budget} />}
          <div className="card p-5">
            <p className="font-semibold">What I'm watching</p>
            <ul className="mt-3 space-y-2 text-sm">
              {GOAL_TYPES[goal.type].watches.map((w) => (
                <li key={w} className="flex items-center gap-2"><span className="h-2 w-2 animate-glow rounded-full bg-emerald-500" />{w}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">You'll get an alert when something here changes in a way that matters for this goal.</p>
          </div>
          <button onClick={() => go("/pipeline")} className="btn-ghost w-full">View my plan →</button>
        </aside>
      </div>
    </main>
  );
}
