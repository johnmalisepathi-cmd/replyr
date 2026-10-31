import { useEffect, useMemo, useRef, useState } from "react";
import { go } from "../lib/router.js";
import { GOAL_TYPES, PLAN_STAGES } from "../lib/goals.js";
import { findsFor, homeOf } from "../lib/geo.js";
import { formatMoney, monthlyRepayment, priceOf } from "../lib/match.js";
import { advicePrompt, aiErrorText, aiPlan, checkinPrompt, useAI } from "../lib/ai.js";
import { agentLog, billSavings, dueText, goalProgress, isComplete, planFor, savingsStatus } from "../lib/plans.js";
import { FitBadge, FitBar, ProgressRing } from "../components/ui.jsx";
import WorldMap from "../components/WorldMap.jsx";
import { AIBadge, AIText, AIThinking, IndustryIcon, Sparkle } from "../components/ai-ui.jsx";
import { boundsOf, countdown } from "./Dashboard.jsx";

const money = (n) => `$${Math.round(n).toLocaleString("en-AU")}`;

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

// Savings towards the goal: how much is in, and what to add each week.
function SavingsCard({ goal, status, onAdd }) {
  const [custom, setCustom] = useState("");
  const label = goal.type === "home" ? "Deposit saved (10%)" : "Saved so far";
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{label}</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums">{money(status.saved)} <span className="text-sm font-medium text-slate-500">of {money(status.target)}</span></p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.saved >= status.target ? "bg-brand-100 text-brand-700" : status.onTrack ? "bg-brand-50 text-brand-700" : "bg-amber-100 text-amber-800"}`}>
          {status.saved >= status.target ? "Done ✓" : status.onTrack ? "On track" : "A bit behind"}
        </span>
      </div>
      <div className="mt-3"><FitBar score={Math.round(status.share * 100)} /></div>
      {status.saved < status.target && (
        <p className="mt-3 text-sm text-slate-600">
          Put aside <strong>{money(Math.ceil(status.weekly / 10) * 10)} a week</strong> to be ready by {new Date(goal.when).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}.
          {!status.onTrack && ` You're about ${money(status.gap)} behind, so this week's amount catches you up.`}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[50, 100, Math.ceil(status.weekly / 10) * 10].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((v) => (
          <button key={v} onClick={() => onAdd(v)} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">+{money(v)}</button>
        ))}
        <form className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); if (Number(custom)) onAdd(Number(custom)); setCustom(""); }}>
          <label htmlFor="sv-amt" className="sr-only">Amount saved</label>
          <input id="sv-amt" inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))} placeholder="Other $" className="input w-24 py-1.5" />
          <button type="submit" className="btn-dark px-3 py-1.5">Add</button>
        </form>
      </div>
    </div>
  );
}

// "Cut my bills": switch the deals the agent found, then send the saving to another goal.
function BillSavings({ goal, prog, profile, finds, actions }) {
  const b = billSavings(goal, prog);
  const target = profile.goals.find((g) => g.id === goal.fundsGoal) || profile.goals.find((g) => g.id !== goal.id && savingsStatus(g, {}));
  const unsent = Math.max(0, b.perYear - b.sent);
  const bills = finds.filter((s) => s.op.priceLabel?.startsWith("Save"));
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">Money found for you</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-brand-700">{money(b.perYear)}<span className="text-sm font-medium text-slate-500"> a year, of your {money(b.target)} goal</span></p>
        </div>
        <span className="text-3xl" aria-hidden="true">💰</span>
      </div>
      <div className="mt-3"><FitBar score={Math.round(b.share * 100)} /></div>
      <ul className="mt-4 space-y-2">
        {bills.map(({ op }) => {
          const on = (prog.switched || []).includes(op.id);
          return (
            <li key={op.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{op.title}</p>
                <p className="text-xs text-slate-500">{op.tag}</p>
              </div>
              <button onClick={() => actions.toggleSwitch(goal.id, op.id)} aria-pressed={on} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                {on ? "Switched ✓" : `Switch · ${op.priceLabel.replace("Save ~", "")}`}
              </button>
            </li>
          );
        })}
      </ul>
      {target && (
        <div className="mt-4 rounded-xl bg-brand-50 p-3 text-sm text-brand-900">
          {unsent > 0 ? (
            <>
              <p>That's <strong>{money(unsent)}</strong> a year you could put towards <strong>{target.title}</strong>.</p>
              <button onClick={() => actions.sendSavings(goal.id, target.id, unsent)} className="btn-primary mt-2 px-4 py-1.5">Send {money(unsent)} to {target.title} →</button>
            </>
          ) : b.sent > 0 ? (
            <p>✓ {money(b.sent)} of savings sent to <strong>{target.title}</strong>.</p>
          ) : (
            <p>Switch a bill above, and I'll help you put the saving towards <strong>{target.title}</strong>.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Goal({ id, profile, pipeline, setStage, progress, goalActions }) {
  const goal = profile.goals.find((g) => g.id === id);
  const prog = progress[id] || {};
  const ai = useAI();
  const [advice, setAdvice] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkin, setCheckin] = useState("");
  const [checking, setChecking] = useState(false);
  const [planning, setPlanning] = useState(false);
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

  const steps = planFor(goal, prog);
  const savings = goal.type === "money" ? null : savingsStatus(goal, prog);
  const bills = goal.type === "money" ? billSavings(goal, prog) : null;
  const progressPct = Math.round(goalProgress(goal, prog) * 100);
  const complete = isComplete(goal, prog);
  const moneyText = bills ? `Bills switched: ${money(bills.perYear)} a year of a ${money(bills.target)} target.` : savings ? `Saved ${money(savings.saved)} of ${money(savings.target)}; ${savings.onTrack ? "on track" : `${money(savings.gap)} behind`}; needs ${money(savings.weekly)} a week.` : "No savings needed.";

  const stream = async (prompt, set, setFlag) => {
    ctl.current?.abort();
    ctl.current = new AbortController();
    setFlag(true);
    setNote("");
    set("");
    try {
      await ai.text(prompt, { signal: ctl.current.signal, onText: ({ text }) => set(text) });
    } catch (e) {
      setNote(aiErrorText(e));
    }
    setFlag(false);
  };

  const replan = async () => {
    setPlanning(true);
    setNote("");
    try {
      const next = await aiPlan(goal);
      if (next) goalActions.setSteps(goal.id, next);
      else setNote("The AI couldn't write a plan just now, so I kept the current one.");
    } catch (e) {
      setNote(aiErrorText(e));
    }
    setPlanning(false);
  };

  // Without AI, the check-in is written from the plan itself.
  const quickCheckin = () => {
    const next = steps.filter((s) => !s.done).slice(0, 2);
    const doneCount = steps.filter((s) => s.done).length;
    return [
      "## This week",
      `${doneCount} of ${steps.length} steps done. ${moneyText}`,
      "## Do these next",
      ...next.map((s) => `- **${s.title}**: ${dueText(s.due).toLowerCase()}. ${s.detail}`),
      savings && savings.saved < savings.target ? `- **Savings**: put aside ${money(Math.ceil(savings.weekly / 10) * 10)} this week.` : null,
      "## I'm handling",
      `- ${agentLog(goal, finds.length)[0]}, and I'll alert you if anything changes.`,
    ].filter(Boolean).join("\n");
  };

  return (
    <main className="section py-8">
      <button onClick={() => go("/dashboard")} className="text-sm text-slate-500 hover:text-slate-900">← Today</button>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-ai-cyan">
          <IndustryIcon id={goal.type} className="h-8 w-8" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{GOAL_TYPES[goal.type].label}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{goal.title}</h1>
          {goal.wish && <p className="mt-1 text-slate-600">"{goal.wish}"</p>}
        </div>
        <ProgressRing value={progressPct} size={72} label={`${goal.title} progress`} />
      </div>

      {complete && (
        <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-1 text-lg font-bold text-brand-800">Goal complete!</p>
          <p className="text-sm text-brand-700">Every step is done. Nice work. I'll keep this goal in your history.</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="card p-3"><p className="text-xs text-slate-500">{goal.type === "money" ? "Target saving" : "Budget"}</p><p className="font-bold">{goal.budget ? `${formatMoney(goal.budget)}${goal.type === "money" ? "/yr" : ""}` : "Not set"}</p></div>
        <div className="card p-3"><p className="text-xs text-slate-500">When</p><p className="font-bold">{countdown(goal.when)}</p></div>
        <div className="card p-3"><p className="text-xs text-slate-500">Where</p><p className="truncate font-bold">{goal.location}</p></div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* THE PLAN */}
          <section className="card p-5" aria-labelledby="plan-h">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="plan-h" className="font-semibold">The plan</h2>
              {ai && (
                <button onClick={replan} disabled={planning} className="text-xs font-semibold text-violet-700 hover:text-violet-900 disabled:opacity-50">
                  {planning ? "Writing a new plan…" : "✨ Tailor this plan with AI"}
                </button>
              )}
            </div>
            <ol className="mt-4 space-y-1">
              {steps.map((s, i) => {
                const late = !s.done && new Date(s.due) < new Date(new Date().toDateString());
                return (
                  <li key={s.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => goalActions.toggleStep(goal.id, s.id)}
                        aria-pressed={s.done}
                        aria-label={`${s.done ? "Mark not done" : "Mark done"}: ${s.title}`}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${s.done ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300 text-transparent hover:border-brand-400"}`}
                      >
                        ✓
                      </button>
                      {i < steps.length - 1 && <span className={`w-0.5 flex-1 ${s.done ? "bg-brand-300" : "bg-slate-200"}`} />}
                    </div>
                    <div className="min-w-0 flex-1 pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`font-medium ${s.done ? "text-slate-400 line-through" : ""}`}>{s.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.who === "agent" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"}`}>
                          {s.who === "agent" ? "🤖 Agent does this" : "🙋 You do this"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">{s.detail}</p>
                      <p className={`mt-0.5 text-xs ${s.done ? "text-brand-600" : late ? "font-semibold text-amber-700" : "text-slate-500"}`}>{s.done ? "Done" : dueText(s.due)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* WEEKLY CHECK-IN */}
          <div className="ai-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-semibold text-white"><Sparkle className="h-5 w-5 text-ai-cyan" /> Weekly check-in</p>
              <AIBadge live={!!ai} />
            </div>
            {checkin ? (
              <div className="mt-4"><AIText text={checkin} streaming={checking} /></div>
            ) : checking ? (
              <div className="mt-4"><AIThinking label="Checking your progress" /></div>
            ) : (
              <>
                <p className="mt-2 text-sm text-slate-400">Every week the agent checks your progress, tells you what to do next and what it's handling.</p>
                <button onClick={() => (ai ? stream(checkinPrompt(profile, goal, steps, moneyText, finds), setCheckin, setChecking) : setCheckin(quickCheckin()))} className="btn-ai mt-4">
                  <Sparkle /> Check in now
                </button>
              </>
            )}
            {checkin && !checking && <button onClick={() => setCheckin("")} className="mt-3 text-xs font-medium text-ai-cyan hover:text-white">Close</button>}

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-sm font-semibold text-white">Advice: what to choose</p>
              {!advice && !busy && (
                <button disabled={!ai} onClick={() => stream(advicePrompt(goal, finds), setAdvice, setBusy)} className="btn mt-3 border border-white/20 text-white hover:bg-white/10">
                  {ai ? "Compare my options" : "AI not connected in this view"}
                </button>
              )}
              {busy && !advice && <div className="mt-4"><AIThinking label="Comparing every option for you" /></div>}
              {advice && <div className="mt-4"><AIText text={advice} streaming={busy} /></div>}
            </div>
            {note && <p className="mt-3 text-xs text-amber-300">{note}</p>}
          </div>

          {goal.type !== "money" && finds.length > 0 && (
            <WorldMap items={finds} home={homeOf(profile)} initialView={boundsOf(finds)} onOpen={(op) => document.getElementById(`find-${op.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} title={`${goal.title}: on the map`} />
          )}

          <h2 className="text-lg font-bold">What I found</h2>
          <ul className="space-y-4">
            {finds.map(({ op, score, reasons, gaps }) => (
              <li key={op.id} id={`find-${op.id}`} className="card scroll-mt-24 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${op.kind === "watch" ? "border border-dashed border-violet-400 bg-violet-50 text-violet-700" : "bg-navy-900 text-white"}`}>
                    {op.kind === "watch" ? "Tracking for you" : "Available now"}
                  </span>
                  {op.kind === "option" && goal.type !== "money" && <FitBadge score={score} />}
                </div>
                <p className="mt-3 text-lg font-semibold leading-snug">{op.title}</p>
                <p className="text-sm text-slate-500">{[op.location, priceOf(op), op.rating ? `${op.rating} ★` : null, op.tag].filter(Boolean).join(" · ")}</p>
                {op.kind === "option" && goal.type !== "money" && <div className="mt-3"><FitBar score={score} /></div>}
                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {Object.entries(op.facts).map(([k, v]) => (
                    <div key={k} className="flex gap-2"><dt className="shrink-0 text-slate-500">{k}:</dt><dd className="font-medium">{v}</dd></div>
                  ))}
                </dl>
                {goal.type !== "money" && (reasons.length > 0 || gaps.length > 0) && (
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
          {bills && <BillSavings goal={goal} prog={prog} profile={profile} finds={finds} actions={goalActions} />}
          {savings && <SavingsCard goal={goal} status={savings} onAdd={(v) => goalActions.addSaved(goal.id, v)} />}
          {goal.type === "home" && <RepaymentCalc budget={goal.budget} />}
          <div className="card p-5">
            <p className="font-semibold">What the agent did for you</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {agentLog(goal, finds.length).map((w) => (
                <li key={w} className="flex gap-2"><span className="text-violet-600">🤖</span>{w}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-semibold">Watching 24/7</p>
            <ul className="mt-2 space-y-2 text-sm">
              {GOAL_TYPES[goal.type].watches.map((w) => (
                <li key={w} className="flex items-center gap-2"><span className="h-2 w-2 animate-glow rounded-full bg-emerald-500" />{w}</li>
              ))}
            </ul>
          </div>
          <button onClick={() => go("/pipeline")} className="btn-ghost w-full">View saved finds →</button>
        </aside>
      </div>
    </main>
  );
}
