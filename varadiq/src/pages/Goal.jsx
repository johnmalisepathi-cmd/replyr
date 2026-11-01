import { useEffect, useMemo, useRef, useState } from "react";
import { go } from "../lib/router.js";
import { GOAL_TYPES, PLAN_STAGES } from "../lib/goals.js";
import { distanceKm, findsFor, homeOf } from "../lib/geo.js";
import { monthlyRepayment, priceOf } from "../lib/match.js";
import { advicePrompt, aiErrorText, aiPlan, canSearchLive, checkinPrompt, comparePrompt, liveFinds, useAI } from "../lib/ai.js";
import { agentLog, billSavings, dueText, goalProgress, isComplete, planFor, savingsStatus } from "../lib/plans.js";
import { FitBadge, FitBar, ProgressRing } from "../components/ui.jsx";
import Mandala from "../components/Mandala.jsx";
import LocationCard from "../components/LocationCard.jsx";
import { formatKm } from "../lib/location.js";
import { currentLocale, defaultHome, myMoney } from "../lib/locale.js";
import WorldMap from "../components/WorldMap.jsx";
import { AIBadge, AIText, AIThinking, IndustryIcon, Sparkle } from "../components/ai-ui.jsx";
import { boundsOf, countdown } from "./Dashboard.jsx";

const money = (n) => myMoney(n);

// Home goals: what the (sample) interest rate means for repayments.
function RepaymentCalc({ budget }) {
  const [price, setPrice] = useState(budget || 700000);
  const [deposit, setDeposit] = useState(Math.round((budget || 700000) * 0.1 / 5000) * 5000);
  const [rate, setRate] = useState(6.1);
  const loan = Math.max(0, price - deposit);
  const pay = monthlyRepayment(loan, rate);
  const buffer = monthlyRepayment(loan, rate + 3);
  const fields = [
    ["rc-price", "Home price", price, setPrice, 200000, 2000000, 5000, myMoney(price)],
    ["rc-dep", "Deposit", deposit, setDeposit, 0, price * 0.5, 5000, `${myMoney(deposit)} (${Math.round((deposit / price) * 100)}%)`],
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
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Monthly repayment</p><p className="text-xl font-extrabold tabular-nums">{myMoney(pay)}</p></div>
        <div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-amber-800">If rates rise 3%</p><p className="text-xl font-extrabold tabular-nums text-amber-900">{myMoney(buffer)}</p></div>
      </div>
      <p className="mt-3 text-xs text-slate-500">30-year principal-and-interest loan of {myMoney(loan)}. General information only, not financial advice. Lenders usually test you at about 3% above the rate.</p>
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
          Put aside <strong>{money(Math.ceil(status.weekly / 10) * 10)} a week</strong> to be ready by {new Date(goal.when).toLocaleDateString(undefined, { day: "numeric", month: "short" })}.
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

const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
const ago = (iso) => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`;
};

// Real options found on the web by the AI, with links to the provider's page.
// A goal detail (budget, date, place) that turns into a small form when tapped.
function EditableStat({ label, shown, type, value, placeholder, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const id = `edit-${label.replace(/\W+/g, "-").toLowerCase()}`;
  if (!editing) {
    return (
      <button
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="card group p-3 text-center transition hover:border-brand-300"
        aria-label={`${label}: ${shown}. Tap to change`}
      >
        <p className="text-xs text-slate-500">{label} <span className="text-brand-600 opacity-70 group-hover:opacity-100" aria-hidden="true">✎</span></p>
        <p className="truncate font-bold">{shown}</p>
      </button>
    );
  }
  return (
    <form
      className="card col-span-3 flex flex-col gap-2 p-3 text-left sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(String(draft));
        setEditing(false);
      }}
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="text-xs text-slate-500">{label}</label>
        <input id={id} autoFocus className="input mt-1" type={type} min={type === "number" ? 0 : undefined} inputMode={type === "number" ? "numeric" : undefined} value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary px-4 py-2">Save</button>
        <button type="button" onClick={() => setEditing(false)} className="btn-ghost px-4 py-2">Cancel</button>
      </div>
    </form>
  );
}

// Button wording by kind of goal: trips are booked, things are bought.
const VIEW_LABEL = { holiday: "View & book", dining: "View & book", events: "View & book", home: "View listing", career: "View & apply", money: "View plan" };

function LiveFinds({ goal, live, near, onFound, busy, setBusy, pick, onChoose, ai }) {
  const [note, setNote] = useState("");
  const [compare, setCompare] = useState("");
  const [comparing, setComparing] = useState(false);
  const runCompare = async () => {
    setComparing(true);
    setCompare("");
    try {
      await ai.text(comparePrompt(goal, live.items), { onText: ({ text }) => setCompare(text) });
    } catch (e) {
      setNote(aiErrorText(e));
    }
    setComparing(false);
  };
  const search = async () => {
    setBusy(true);
    setNote("");
    try {
      const r = await liveFinds(goal, near);
      onFound(r);
      setCompare("");
      if (!r.items.length) setNote("I couldn't find good live options this time. Try again, or add more detail to the goal.");
    } catch (e) {
      setNote([aiErrorText(e), e?.detail ? `(Details: ${e.detail})` : ""].filter(Boolean).join(" "));
    }
    setBusy(false);
  };
  return (
    <section className="ai-panel p-5" aria-labelledby="live-h">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="live-h" className="flex items-center gap-2 font-semibold text-white">🌐 Live from the web</h2>
        {live?.at && <span className="text-xs text-slate-400">Searched {ago(live.at)}</span>}
      </div>
      {!live?.items?.length && !busy && (
        <p className="mt-2 text-sm text-slate-400">The AI searches the web right now for real options for this goal, with links to view and book on the provider's own site.</p>
      )}
      {busy && <div className="mt-4"><AIThinking label="Searching the web for you (about 20 seconds)" /></div>}
      {live?.items?.length > 0 && !busy && (
        <ul className="mt-4 space-y-3">
          {live.items.map((it) => (
            <li key={it.url} className="glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-white">{it.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{[it.location, it.price, host(it.url) !== (it.location || "").toLowerCase() ? host(it.url) : null].filter(Boolean).join(" · ")}</p>
                {it.why && <p className="mt-1 text-sm text-slate-300">{it.why}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <a href={it.url} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary px-4 py-2">{VIEW_LABEL[goal.type] || "View & buy"} →</a>
                <button
                  onClick={() => onChoose(pick?.url === it.url ? null : it)}
                  aria-pressed={pick?.url === it.url}
                  className={`btn px-4 py-2 ${pick?.url === it.url ? "bg-amber-400 text-navy-950" : "border border-white/20 text-white hover:bg-white/10"}`}
                >
                  {pick?.url === it.url ? "Chosen ✓" : "Choose this"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {compare && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"><AIText text={compare} streaming={comparing} /></div>}
      {comparing && !compare && <div className="mt-4"><AIThinking label="Comparing the options for you" /></div>}
      {!busy && (
        <div className="mt-4 flex flex-wrap gap-2">
          {live?.items?.length > 1 && ai && !comparing && (
            <button onClick={runCompare} className="btn-ai"><Sparkle /> {compare ? "Compare again" : "Compare these for me"}</button>
          )}
          <button onClick={search} className={`${live?.items?.length ? "btn border border-white/20 text-white hover:bg-white/10" : "btn-ai"}`}>
            {live?.items?.length ? "Search again" : <><Sparkle /> Search the web for this goal</>}
          </button>
        </div>
      )}
      {note && <p className="mt-3 text-xs text-amber-300">{note}</p>}
      <p className="mt-3 text-[11px] text-slate-500">Found by AI on public websites. Prices and availability can change, so confirm on the provider's site before you book or buy.</p>
    </section>
  );
}

export default function Goal({ id, profile, setProfile, pipeline, setStage, progress, goalActions }) {
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
  const allFinds = useMemo(() => findsFor(profile).filter((s) => s.goal.id === id), [profile, id]);
  const [searching, setSearching] = useState(false);
  const [editedAfterSearch, setEditedAfterSearch] = useState(false);

  if (!goal) {
    return (
      <main className="section py-16 text-center">
        <p className="text-slate-600">That goal wasn't found.</p>
        <button className="btn-dark mt-4" onClick={() => go("/dashboard")}>Back to dashboard</button>
      </main>
    );
  }

  // Examples only show when they fit this goal: a trip's examples must be in its
  // destination; local goals (dinner, homes…) only near the person.
  const near = homeOf(profile);
  const fits = (s) => {
    if (goal.type === "holiday") {
      const where = (goal.location || "").toLowerCase().split(",")[0].trim();
      return !!where && `${s.op.location} ${s.op.region} ${s.op.title} ${s.op.tags.join(" ")}`.toLowerCase().includes(where);
    }
    if (["dining", "home", "car"].includes(goal.type)) return s.op.distanceKm <= 100;
    return true;
  };
  const live = canSearchLive && goal.type !== "money";
  // Shopping somewhere other than home (e.g. a phone in Singapore): search there, not near home.
  const placeLc = (goal.location || "").trim().toLowerCase();
  const homeNames = [near.city, defaultHome(profile).city, currentLocale().countryName].map((x) => (x || "").toLowerCase());
  const buyElsewhere = goal.type !== "holiday" && !!placeLc && !homeNames.some((h) => h && (placeLc.includes(h) || h.includes(placeLc)));
  const finds = live ? allFinds.filter(fits) : allFinds;
  // Live places with a location, shaped like finds so the map can pin them.
  const livePoints = (prog.live?.items || [])
    .filter((it) => Number.isFinite(it.lat) && Number.isFinite(it.lng))
    .map((it, i) => ({
      op: { id: `live-${i}`, title: it.title, location: it.location || "", region: "", lat: it.lat, lng: it.lng, priceLabel: it.price, kind: "option", tag: "Live", url: it.url, distanceKm: Math.round(distanceKm(near, it) * 10) / 10 },
      score: 90,
      goal,
    }));
  const mapItems = livePoints.length ? livePoints : finds;
  const mapStatus = searching ? "searching" : livePoints.length ? "live" : "example";

  const updateGoal = (patch) => {
    setProfile({ ...profile, goals: profile.goals.map((g) => (g.id === goal.id ? { ...g, ...patch } : g)) });
    setEditedAfterSearch(true);
  };

  const steps = planFor(goal, prog);
  // Choosing a live option ticks the person's "decide / pick / choose" step, and
  // any shortlisting step before it (choosing means the shortlist is done).
  const decideAt = steps.findIndex((st) => !st.done && st.who === "you" && /decide|pick|choose/i.test(st.title));
  const pickSteps = decideAt < 0 ? [] : steps.slice(0, decideAt + 1).filter((st, i) => i === decideAt || /shortlist/i.test(st.title)).map((st) => st.id);
  const choosePick = (it) => goalActions.choose(goal.id, it && { title: it.title, location: it.location, price: it.price, url: it.url, at: new Date().toISOString() }, pickSteps);
  const savings = goal.type === "money" ? null : savingsStatus(goal, prog);
  const bills = goal.type === "money" ? billSavings(goal, prog) : null;
  const progressPct = Math.round(goalProgress(goal, prog) * 100);
  const complete = isComplete(goal, prog);
  const pickText = prog.pick ? ` Their chosen option: ${prog.pick.title}${prog.pick.price ? ` (${prog.pick.price})` : ""}.` : "";
  const moneyText = (bills ? `Bills switched: ${money(bills.perYear)} a year of a ${money(bills.target)} target.` : savings ? `Saved ${money(savings.saved)} of ${money(savings.target)}; ${savings.onTrack ? "on track" : `${money(savings.gap)} behind`}; needs ${money(savings.weekly)} a week.` : "No savings needed.") + pickText;

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
          <Mandala size={64} gold className="mx-auto" />
          <p className="mt-1 text-lg font-bold text-brand-800">Goal complete!</p>
          <p className="text-sm text-brand-700">Every step is done. Nice work. I'll keep this goal in your history.</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <EditableStat
          label={goal.type === "money" ? "Target saving" : "Budget"}
          shown={goal.budget ? `${myMoney(goal.budget)}${goal.type === "money" ? "/yr" : ""}` : "Not set"}
          type="number"
          value={goal.budget ?? ""}
          placeholder={`e.g. 30000 (${currentLocale().currency})`}
          onSave={(v) => updateGoal({ budget: Number(v) > 0 ? Number(v) : null })}
        />
        <EditableStat label="When" shown={countdown(goal.when)} type="date" value={goal.when} onSave={(v) => v && updateGoal({ when: v })} />
        <EditableStat label="Where" shown={goal.location || "Not set"} type="text" value={goal.location || ""} placeholder="e.g. Perth, or Japan" onSave={(v) => updateGoal({ location: v.trim() })} />
      </div>
      {(goal.budget || goal.location) && prog.live?.items?.length > 0 && editedAfterSearch && (
        <p className="mt-2 text-xs text-slate-500">You changed this goal. Tap <strong>Search again</strong> below for results that match.</p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {prog.pick && (
            <div className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">⭐ Your pick</p>
                <p className="mt-0.5 font-semibold">{prog.pick.title}</p>
                <p className="text-sm text-slate-600">{[prog.pick.location, prog.pick.price].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <a href={prog.pick.url} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary px-4 py-2">{VIEW_LABEL[goal.type] || "View & buy"} →</a>
                <button onClick={() => goalActions.choose(goal.id, null)} className="btn-ghost px-4 py-2">Change</button>
              </div>
            </div>
          )}

          {canSearchLive && goal.type !== "money" && (
            <LiveFinds goal={goal} live={prog.live} near={{ label: near.city, ...currentLocale(), elsewhere: buyElsewhere }} onFound={(r) => goalActions.setLive(goal.id, r)} busy={searching} setBusy={setSearching} pick={prog.pick} ai={ai} onChoose={choosePick} />
          )}

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

          {["dining", "home", "tech", "car"].includes(goal.type) && <LocationCard profile={profile} setProfile={setProfile} compact />}

          {goal.type !== "money" && (mapItems.length > 0 || searching) && (
            <WorldMap
              key={`${mapStatus}-${mapItems.length}`}
              items={mapItems}
              home={near}
              initialView={mapItems.length ? boundsOf(mapItems, goal.type === "holiday" ? [14, 10] : [1.2, 0.8]) : "World"}
              onOpen={(op) => (op.url ? window.open(op.url, "_blank", "noopener,noreferrer") : document.getElementById(`find-${op.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }))}
              title={`${goal.title}: on the map`}
              status={mapStatus}
              statusNote={prog.live?.at ? `Updated ${ago(prog.live.at)} · ${livePoints.length} ${livePoints.length === 1 ? "place" : "places"}` : ""}
            />
          )}

          {(!live || finds.length > 0) && <h2 className="text-lg font-bold">{live ? "Example finds" : "What I found"}</h2>}
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
                  {goal.type === "dining" && (
                    <div className="flex gap-2"><dt className="shrink-0 text-slate-500">Distance:</dt><dd className="font-medium">{formatKm(op.distanceKm, homeOf(profile).units)} from {homeOf(profile).city}</dd></div>
                  )}
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
            {!finds.length && !live && <li className="card p-8 text-center text-slate-500">I'm watching for this. Nothing new yet.</li>}
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
