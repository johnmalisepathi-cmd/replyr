import { useEffect, useMemo, useRef, useState } from "react";
import { go } from "../lib/router.js";
import { OPPORTUNITIES } from "../lib/data.js";
import { daysUntil, formatMoney, scoreOpportunity, searchOpportunities } from "../lib/match.js";
import { FitBadge, FitBar, KindBadge } from "../components/ui.jsx";
import { aiErrorText, askPrompt, splitIds, useAI } from "../lib/ai.js";
import { AIBadge, AIText, AIThinking, Sparkle } from "../components/ai-ui.jsx";

const EXAMPLES = ["Show projects that need 6 mm to 20 mm steel plate cutting within 250 km of Perth", "Which jobs can I win without installing on site?", "What closes soonest that I should bid on?"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Dashboard({ profile, pipeline }) {
  const ai = useAI();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [aiIds, setAiIds] = useState(null);
  const [aiNote, setAiNote] = useState("");
  const ctl = useRef(null);
  useEffect(() => () => ctl.current?.abort(), []);
  const [kind, setKind] = useState("all");
  const [minFit, setMinFit] = useState(0);

  const scored = useMemo(
    () => OPPORTUNITIES.map((op) => ({ op, ...scoreOpportunity(op, profile) })).sort((a, b) => b.score - a.score),
    [profile]
  );

  // With live AI the assistant picks the opportunities; without it, a keyword
  // and distance filter runs as you type.
  const visible = useMemo(() => {
    const ids = ai ? (aiIds ? new Set(aiIds) : null) : new Set(searchOpportunities(OPPORTUNITIES, query).map((o) => o.id));
    return scored.filter((s) => (!ids || ids.has(s.op.id)) && (kind === "all" || s.op.kind === kind) && s.score >= minFit);
  }, [scored, query, kind, minFit, ai, aiIds]);

  const ask = async (q = query) => {
    if (!ai || !q.trim()) return;
    ctl.current?.abort();
    ctl.current = new AbortController();
    setQuery(q);
    setAsking(true);
    setAnswer("");
    setAiNote("");
    try {
      const text = await ai.text(askPrompt(q, profile, scored), {
        signal: ctl.current.signal,
        onText: ({ text: t }) => setAnswer(splitIds(t).body),
      });
      const { body, ids } = splitIds(text);
      setAnswer(body);
      setAiIds(ids && ids.length ? ids : null);
    } catch (e) {
      setAiNote(aiErrorText(e));
    }
    setAsking(false);
  };

  const clearAsk = () => {
    ctl.current?.abort();
    setQuery("");
    setAnswer("");
    setAiIds(null);
    setAiNote("");
    setAsking(false);
  };

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

      <div className="ai-panel mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="ask" className="flex items-center gap-2 font-semibold text-white">
            <Sparkle className="h-5 w-5 text-ai-cyan" /> Ask OpportunityIQ
          </label>
          <AIBadge live={!!ai} />
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
        >
          <input
            id="ask"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ai ? "Ask anything, e.g. which jobs suit my press brakes?" : "Search, e.g. plate cutting within 250 km of Perth"}
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-ai-cyan focus:outline-none focus:ring-2 focus:ring-ai-cyan/30"
          />
          {ai && (
            <button type="submit" disabled={asking || !query.trim()} className="btn-ai shrink-0 px-4">
              {asking ? "…" : "Ask"}
            </button>
          )}
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button key={e} disabled={asking} onClick={() => (ai ? ask(e) : setQuery(e))} className="rounded-full border border-white/15 px-3 py-1 text-left text-xs text-slate-200 hover:border-ai-cyan hover:text-white disabled:opacity-40">
              {e}
            </button>
          ))}
          {(query || answer) && <button onClick={clearAsk} className="rounded-full px-3 py-1 text-xs text-ai-cyan">Clear</button>}
        </div>
        {asking && !answer && <div className="mt-4"><AIThinking label="Reading every opportunity against your profile" /></div>}
        {answer && <div className="mt-4 border-t border-white/10 pt-4"><AIText text={answer} streaming={asking} /></div>}
        {aiNote && <p className="mt-3 text-xs text-amber-300">{aiNote}</p>}
        {!ai && <p className="mt-3 text-xs text-slate-400">Searching by keywords and distance. Live AI answers appear when AI is connected.</p>}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">
          {visible.length} opportunities
          {aiIds && (
            <span className="ml-2 align-middle text-xs font-medium text-violet-600">
              picked by AI · <button onClick={() => setAiIds(null)} className="underline">show all</button>
            </span>
          )}
        </h2>
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
