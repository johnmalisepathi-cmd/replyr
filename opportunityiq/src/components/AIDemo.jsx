import { useEffect, useRef, useState } from "react";
import { go } from "../lib/router.js";
import { INDUSTRIES, OPPORTUNITIES } from "../lib/data.js";
import { scoreOpportunity } from "../lib/match.js";
import { aiErrorText, getAI, matchBriefPrompt, profileFromText, useAI } from "../lib/ai.js";
import { FitBar } from "./ui.jsx";
import { AIBadge, AIText, AIThinking, Sparkle } from "./ai-ui.jsx";

const EXAMPLES = [
  {
    label: "Perth steel workshop",
    text: "We're a 12-person steel workshop in Welshpool, Perth. Fibre laser cutting, two CNC press brakes and certified welders. ISO 9001. We like jobs around $50k–$250k and don't do site installation.",
  },
  {
    label: "Engineering consultancy",
    text: "Fremantle structural engineering consultancy. NER-registered engineers doing bridge inspections, structural design and drafting/BIM for councils and industry.",
  },
  {
    label: "Cleaning company",
    text: "Perth commercial cleaning company, 60 police-cleared staff, ISO 9001. We clean offices, schools and council buildings, plus windows and washrooms.",
  },
  {
    label: "IT & cyber firm",
    text: "Perth IT company doing cybersecurity, cloud services and IT support for government. ISO 27001 certified, Essential Eight specialists.",
  },
  {
    label: "Uniform maker",
    text: "Brisbane uniform manufacturer: hi-vis workwear with embroidery and screen printing for big employers.",
  },
];

export default function AIDemo({ setProfile }) {
  const ai = useAI();
  const [desc, setDesc] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | reading | matching | done
  const [profile, setLocalProfile] = useState(null);
  const [top, setTop] = useState([]);
  const [brief, setBrief] = useState("");
  const [note, setNote] = useState("");
  const ctl = useRef(null);
  useEffect(() => () => ctl.current?.abort(), []);

  const run = async (text = desc) => {
    if (!text.trim()) return;
    ctl.current?.abort();
    ctl.current = new AbortController();
    const signal = ctl.current.signal;
    setPhase("reading");
    setBrief("");
    setNote("");
    setTop([]);

    const { profile: p, usedAI, note: n } = await profileFromText(text);
    if (signal.aborted) return;
    setLocalProfile(p);
    setNote(n);
    const ranked = OPPORTUNITIES.map((op) => ({ op, ...scoreOpportunity(op, p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    setTop(ranked);
    setPhase("matching");

    const live = usedAI && (await getAI());
    if (!live) {
      setPhase("done");
      return;
    }
    try {
      await live.text(matchBriefPrompt(p, ranked), { signal, onText: ({ text: t }) => setBrief(t) });
    } catch (e) {
      if (e?.code !== "cancelled") setNote(aiErrorText(e));
    }
    if (!signal.aborted) setPhase("done");
  };

  const pickExample = (t) => {
    setDesc(t);
    run(t);
  };

  const busy = phase === "reading" || phase === "matching";

  return (
    <div className="ai-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkle className="h-5 w-5 text-ai-cyan" />
          <p className="font-semibold text-white">Describe your business. The AI finds your work.</p>
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
        <label htmlFor="ai-desc" className="sr-only">Describe your business</label>
        <textarea
          id="ai-desc"
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="e.g. We're a steel workshop in Perth with laser cutting, CNC folding and certified welders…"
          className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-ai-cyan focus:outline-none focus:ring-2 focus:ring-ai-cyan/30"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.label} type="button" onClick={() => pickExample(ex.text)} disabled={busy} className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200 hover:border-ai-cyan hover:text-white disabled:opacity-40">
              {ex.label}
            </button>
          ))}
        </div>
        <button type="submit" disabled={busy || !desc.trim()} className="btn-ai w-full py-3 text-base">
          <Sparkle /> {busy ? "AI is working…" : "Find my opportunities"}
        </button>
      </form>

      {phase !== "idle" && (
        <div className="space-y-4 border-t border-white/10 bg-black/20 p-5">
          {phase === "reading" && <AIThinking label={ai ? "Reading your description and building your capability profile" : "Matching your description"} />}

          {profile && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ai-violet">AI understood</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[INDUSTRIES[profile.industry].label, profile.region, ...profile.capabilities, ...profile.certifications].map((c) => (
                  <span key={c} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-100">{c}</span>
                ))}
              </div>
            </div>
          )}

          {top.length > 0 && (
            <ul className="space-y-3">
              {top.map(({ op, score }) => (
                <li key={op.id} className="glass p-3">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium text-white">{op.title}</p>
                    <span className={`shrink-0 text-sm font-bold ${score >= 75 ? "text-brand-300" : score >= 50 ? "text-amber-300" : "text-slate-400"}`}>{score}%</span>
                  </div>
                  <FitBar score={score} dark />
                </li>
              ))}
            </ul>
          )}

          {phase === "matching" && !brief && ai && <AIThinking label="Writing your briefing" />}
          {brief && <AIText text={brief} streaming={phase === "matching"} />}
          {note && <p className="text-xs text-amber-300">{note}</p>}

          {phase === "done" && profile && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">Sample opportunities. Your real matches arrive when the pilot starts.</p>
              <button
                onClick={() => {
                  setProfile(profile);
                  go("/dashboard");
                }}
                className="btn-primary shrink-0"
              >
                Open my AI dashboard →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
