import { useEffect, useMemo, useRef, useState } from "react";
import { go } from "../lib/router.js";
import { findsFor, homeOf } from "../lib/geo.js";
import { daysUntil, priceOf, searchFinds } from "../lib/match.js";
import { aiErrorText, askPrompt, briefingPrompt, splitIds, useAI } from "../lib/ai.js";
import { FitBar } from "../components/ui.jsx";
import WorldMap from "../components/WorldMap.jsx";
import { AIBadge, AIText, AIThinking, IndustryIcon, Sparkle } from "../components/ai-ui.jsx";

const EXAMPLES = ["Where should we eat tonight?", "Is now a good time to book Bali?", "Which phone should I buy?"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function countdown(date) {
  const d = daysUntil(date);
  if (d === null) return "";
  if (d <= 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d < 60) return `In ${d} days`;
  return `In ${Math.round(d / 30.4)} months`;
}

// Bounds that fit a set of finds, for the map's first view.
export function boundsOf(items) {
  if (!items.length) return "World";
  const lngs = items.map((s) => s.op.lng);
  const lats = items.map((s) => s.op.lat);
  const pad = (lo, hi, min) => {
    const mid = (lo + hi) / 2;
    const half = Math.max((hi - lo) / 2 * 1.3, min / 2);
    return [mid - half, mid + half];
  };
  const [w, e] = pad(Math.min(...lngs), Math.max(...lngs), 1.2);
  const [s, n] = pad(Math.min(...lats), Math.max(...lats), 0.8);
  return [w, s, e, n];
}

export default function Dashboard({ profile, pipeline }) {
  const ai = useAI();
  const [goalFilter, setGoalFilter] = useState("all");
  const [kind, setKind] = useState("all");
  const [shown, setShown] = useState(8);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [aiIds, setAiIds] = useState(null);
  const [brief, setBrief] = useState("");
  const [briefing, setBriefing] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const ctl = useRef(null);
  useEffect(() => () => ctl.current?.abort(), []);

  const scored = useMemo(() => findsFor(profile), [profile]);
  const bestPerGoal = profile.goals.map((g) => scored.find((s) => s.goal.id === g.id)).filter(Boolean);

  const visible = useMemo(() => {
    const ids = ai ? (aiIds ? new Set(aiIds) : null) : new Set(searchFinds(scored.map((s) => s.op), query).map((o) => o.id));
    return scored.filter((s) => (!ids || ids.has(s.op.id)) && (goalFilter === "all" || s.goal.id === goalFilter) && (kind === "all" || s.op.kind === kind));
  }, [scored, query, goalFilter, kind, ai, aiIds]);
  useEffect(() => setShown(8), [goalFilter, kind, aiIds, query]);

  const run = async (prompt, onText) => {
    ctl.current?.abort();
    ctl.current = new AbortController();
    setAiNote("");
    try {
      return await ai.text(prompt, { signal: ctl.current.signal, onText });
    } catch (e) {
      setAiNote(aiErrorText(e));
      return null;
    }
  };

  const getBriefing = async () => {
    setBriefing(true);
    setBrief("");
    await run(briefingPrompt(profile, bestPerGoal), ({ text }) => setBrief(text));
    setBriefing(false);
  };

  const ask = async (q = query) => {
    if (!ai || !q.trim()) return;
    setQuery(q);
    setAsking(true);
    setAnswer("");
    const text = await run(askPrompt(q, profile, scored.slice(0, 40)), ({ text: t }) => setAnswer(splitIds(t).body));
    if (text) {
      const { body, ids } = splitIds(text);
      setAnswer(body);
      setAiIds(ids && ids.length ? ids : null);
    }
    setAsking(false);
  };

  const clearAsk = () => {
    ctl.current?.abort();
    setQuery("");
    setAnswer("");
    setAiIds(null);
    setAsking(false);
  };

  const watches = scored.filter((s) => s.op.kind === "watch").length;

  return (
    <main className="section py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your personal assistant</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        {greeting()}{profile.name ? `, ${profile.name}` : ""}. Here's what changed for your goals.
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          [profile.goals.length, "Goals watched"],
          [scored.length, "Finds so far"],
          [watches, "Things I'm tracking"],
        ].map(([n, l]) => (
          <div key={l} className="card p-4 text-center">
            <p className="text-3xl font-extrabold">{n}</p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">{l}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-bold">Your goals</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {profile.goals.map((g) => {
          const best = bestPerGoal.find((s) => s.goal.id === g.id);
          return (
            <li key={g.id}>
              <button onClick={() => go(`/goal/${g.id}`)} className="card flex h-full w-full flex-col p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-300">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-ai-cyan">
                    <IndustryIcon id={g.type} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{g.title}</p>
                    <p className="text-xs text-slate-500">{countdown(g.when)}</p>
                  </div>
                </div>
                {best ? (
                  <p className="mt-3 text-sm text-slate-700">
                    <span className="font-medium">{best.op.tag}:</span> {best.op.title}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Watching. Nothing new yet.</p>
                )}
                <span className="mt-auto pt-3 text-xs font-medium text-brand-600">Open goal →</span>
              </button>
            </li>
          );
        })}
        <li>
          <button onClick={() => go("/onboarding")} className="flex h-full min-h-[140px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-brand-400 hover:text-brand-600">
            + Add a goal
          </button>
        </li>
      </ul>

      <div className="ai-panel mt-8 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-semibold text-white">
            <Sparkle className="h-5 w-5 text-ai-cyan" /> Today's briefing
          </p>
          <AIBadge live={!!ai} />
        </div>
        {brief ? (
          <div className="mt-4"><AIText text={brief} streaming={briefing} /></div>
        ) : briefing ? (
          <div className="mt-4"><AIThinking label="Checking every goal for what changed" /></div>
        ) : ai ? (
          <button onClick={getBriefing} className="btn-ai mt-4"><Sparkle /> Write today's briefing</button>
        ) : (
          <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
            {bestPerGoal.map((s) => (
              <li key={s.goal.id} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ai-cyan" /><span><strong className="text-white">{s.goal.title}:</strong> {s.op.tag}, {s.op.title}</span></li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-white/10 pt-5">
          <label htmlFor="ask" className="text-sm font-semibold text-white">Ask your assistant</label>
          <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(); }}>
            <input
              id="ask"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ai ? "Ask anything about your goals" : "Search your finds, e.g. thai, villa, camera"}
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-ai-cyan focus:outline-none focus:ring-2 focus:ring-ai-cyan/30"
            />
            {ai && <button type="submit" disabled={asking || !query.trim()} className="btn-ai shrink-0 px-4">{asking ? "…" : "Ask"}</button>}
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} disabled={asking} onClick={() => (ai ? ask(e) : setQuery(e.split(" ").slice(-2).join(" ")))} className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200 hover:border-ai-cyan hover:text-white disabled:opacity-40">{e}</button>
            ))}
            {(query || answer) && <button onClick={clearAsk} className="rounded-full px-3 py-1 text-xs text-ai-cyan">Clear</button>}
          </div>
          {asking && !answer && <div className="mt-4"><AIThinking label="Looking through everything I've found" /></div>}
          {answer && <div className="mt-4"><AIText text={answer} streaming={asking} /></div>}
        </div>
        {aiNote && <p className="mt-3 text-xs text-amber-300">{aiNote}</p>}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">
          {visible.length} finds
          {aiIds && <span className="ml-2 align-middle text-xs font-medium text-violet-600">picked by AI · <button onClick={() => setAiIds(null)} className="underline">show all</button></span>}
        </h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <select value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)} className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200" aria-label="Goal">
            <option value="all">All goals</option>
            {profile.goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
          {[["all", "All"], ["option", "Available now"], ["watch", "Tracking for you"]].map(([k, l]) => (
            <button key={k} onClick={() => setKind(k)} className={`rounded-full px-3 py-1.5 ${kind === k ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <WorldMap key={`${goalFilter}-${kind}-${profile.region}-${visible.length}`} items={visible} home={homeOf(profile)} initialView={boundsOf(visible)} onOpen={(op) => go(`/goal/${visible.find((s) => s.op.id === op.id)?.goal.id}`)} title="Your goal map" />
      </div>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {visible.slice(0, shown).map(({ op, goal, score, reasons, gaps }) => (
          <li key={`${goal.id}-${op.id}`}>
            <button onClick={() => go(`/goal/${goal.id}`)} className="card flex h-full w-full flex-col p-5 text-left transition hover:-translate-y-0.5 hover:border-brand-300">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${op.kind === "watch" ? "border border-dashed border-violet-400 bg-violet-50 text-violet-700" : "bg-navy-900 text-white"}`}>{op.kind === "watch" ? "Tracking for you" : "Available now"}</span>
                <span className="chip">{goal.title}</span>
                {pipeline[op.id] && <span className="chip bg-brand-50 text-brand-700">{pipeline[op.id]}</span>}
              </div>
              <p className="mt-3 font-semibold leading-snug">{op.title}</p>
              <p className="mt-1 text-sm text-slate-500">{[op.location, priceOf(op), op.rating ? `${op.rating} ★` : null].filter(Boolean).join(" · ")}</p>
              {op.kind === "option" && (
                <div className="mt-4 flex items-center gap-3">
                  <FitBar score={score} />
                  <span className="w-12 shrink-0 text-right text-sm font-bold">{score}%</span>
                </div>
              )}
              <p className="mt-2 text-xs text-slate-600">{op.kind === "watch" ? `Tracking: ${op.tag}` : gaps[0] ? `⚠ ${gaps[0]}` : `✓ ${reasons[0]}`}</p>
            </button>
          </li>
        ))}
      </ul>
      {visible.length > shown && (
        <div className="mt-6 text-center">
          <button onClick={() => setShown((n) => n + 8)} className="btn-ghost">Show more ({visible.length - shown} left)</button>
        </div>
      )}
      {!visible.length && <p className="card mt-4 p-8 text-center text-slate-500">Nothing matches those filters yet.</p>}
    </main>
  );
}

