import { useEffect, useRef, useState } from "react";
import { go } from "../lib/router.js";
import { findsFor } from "../lib/geo.js";
import { priceOf } from "../lib/match.js";
import { aiErrorText, briefingPrompt, getAI, goalsFromText, useAI } from "../lib/ai.js";
import { DEFAULT_PROFILE } from "../lib/store.js";
import { FitBar } from "./ui.jsx";
import { AIBadge, AIText, AIThinking, IndustryIcon, Sparkle } from "./ai-ui.jsx";
import VoiceButton from "./VoiceButton.jsx";

const EXAMPLES = [
  {
    label: "Holiday, phone and dinner",
    text: "I'm Sam. We're planning a holiday to Bali in about 6 months, 2 people, under $4,000, ideally a villa with a pool. I also want a new phone with a great camera under $1,200. And tonight I feel like spicy Thai near Perth CBD, about $40 each.",
  },
  {
    label: "Buying our first home",
    text: "We want to buy our first home in Perth within a year: a 3-bed house under $750k near a train line. Please keep an eye on interest rates too.",
  },
  {
    label: "Busy weekend",
    text: "Find me two tickets to a big concert in Perth, a used hybrid SUV under $35k in the next 2 months, and cheaper electricity bills.",
  },
];

export default function AIDemo({ setProfile }) {
  const ai = useAI();
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | reading | briefing | done
  const [result, setResult] = useState(null);
  const [brief, setBrief] = useState("");
  const [note, setNote] = useState("");
  const ctl = useRef(null);
  useEffect(() => () => ctl.current?.abort(), []);

  const run = async (words = text) => {
    if (!words.trim()) return;
    ctl.current?.abort();
    ctl.current = new AbortController();
    const signal = ctl.current.signal;
    setPhase("reading");
    setBrief("");
    setNote("");
    setResult(null);

    const { goals, name, city, usedAI, note: n } = await goalsFromText(words, DEFAULT_PROFILE.city);
    if (signal.aborted) return;
    if (!goals.length) {
      setNote("I couldn't find a goal in that. Try something like \"a holiday to Bali in 6 months\" or \"Thai dinner tonight\".");
      setPhase("idle");
      return;
    }
    const profile = { ...DEFAULT_PROFILE, name, city, goals };
    const all = findsFor(profile);
    const best = goals.map((g) => all.find((s) => s.goal.id === g.id)).filter(Boolean);
    setResult({ profile, best });
    setNote(n);
    setPhase("briefing");

    const live = usedAI && (await getAI());
    if (!live) {
      setPhase("done");
      return;
    }
    try {
      await live.text(briefingPrompt(profile, best), { signal, onText: ({ text: t }) => setBrief(t) });
    } catch (e) {
      if (e?.code !== "cancelled") setNote(aiErrorText(e));
    }
    if (!signal.aborted) setPhase("done");
  };

  const busy = phase === "reading" || phase === "briefing";

  return (
    <div className="ai-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkle className="h-5 w-5 text-ai-cyan" />
          <p className="font-semibold text-white">Tell me what you want. I'll watch for it 24/7.</p>
        </div>
        <AIBadge live={!!ai} />
      </div>

      <form
        className="space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <label htmlFor="ai-wish" className="sr-only">Your goals and wishes</label>
        <div className="relative">
          <textarea
            id="ai-wish"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. A Bali holiday in 6 months under $4,000, a new phone with a great camera, and spicy Thai near me tonight…"
            className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 pr-14 text-sm text-white placeholder:text-slate-500 focus:border-ai-cyan focus:outline-none focus:ring-2 focus:ring-ai-cyan/30"
          />
          <VoiceButton className="absolute bottom-3 right-3" onText={(t) => setText((x) => (x ? `${x} ${t}` : t))} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              disabled={busy}
              onClick={() => {
                setText(ex.text);
                run(ex.text);
              }}
              className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200 hover:border-ai-cyan hover:text-white disabled:opacity-40"
            >
              {ex.label}
            </button>
          ))}
        </div>
        <button type="submit" disabled={busy || !text.trim()} className="btn-ai w-full py-3 text-base">
          <Sparkle /> {busy ? "AI is working…" : "Start watching for me"}
        </button>
      </form>

      {phase !== "idle" && (
        <div className="space-y-4 border-t border-white/10 bg-black/20 p-5">
          {phase === "reading" && <AIThinking label={ai ? "Listening and turning your wishes into goals" : "Finding your goals"} />}

          {result && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ai-violet">
                {result.profile.goals.length} goal{result.profile.goals.length > 1 ? "s" : ""} I'm now watching
              </p>
              <ul className="space-y-3">
                {result.best.map(({ goal, op, score }) => (
                  <li key={goal.id} className="glass p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ai-cyan/10 text-ai-cyan">
                        <IndustryIcon id={goal.type} className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{goal.title}</p>
                        <p className="truncate text-xs text-slate-400">
                          Best find: {op.title} · {priceOf(op)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-500/15 px-2 py-0.5 text-[11px] font-semibold text-brand-200">{op.tag}</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-3">
                      <FitBar score={score} dark />
                      <span className="w-10 shrink-0 text-right text-xs font-bold text-slate-200">{score}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {phase === "briefing" && !brief && ai && <AIThinking label="Writing your first briefing" />}
          {brief && <AIText text={brief} streaming={phase === "briefing"} />}
          {note && <p className="text-xs text-amber-300">{note}</p>}

          {phase === "done" && result && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">Sample finds. Live prices and places arrive at launch.</p>
              <button
                onClick={() => {
                  setProfile(result.profile);
                  go("/dashboard");
                }}
                className="btn-primary shrink-0"
              >
                Open my assistant →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

