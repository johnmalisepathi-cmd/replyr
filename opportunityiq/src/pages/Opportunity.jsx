import { useEffect, useRef, useState } from "react";
import { go } from "../lib/router.js";
import { OPPORTUNITIES, PIPELINE_STAGES } from "../lib/data.js";
import { daysUntil, formatMoney, scoreOpportunity } from "../lib/match.js";
import { FitBadge, FitBar, KindBadge } from "../components/ui.jsx";
import { aiErrorText, analysisPrompt, emailPrompt, useAI } from "../lib/ai.js";
import { AIBadge, AIText, AIThinking, Sparkle } from "../components/ai-ui.jsx";

// One streaming AI task (analysis or email) with its own Stop control.
function useAITask() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const ctl = useRef(null);
  useEffect(() => () => ctl.current?.abort(), []);
  const run = async (ai, prompt) => {
    ctl.current?.abort();
    ctl.current = new AbortController();
    setBusy(true);
    setNote("");
    setText("");
    try {
      await ai.text(prompt, { signal: ctl.current.signal, onText: ({ text: t }) => setText(t) });
    } catch (e) {
      setText(e?.text || "");
      setNote(aiErrorText(e));
    }
    setBusy(false);
  };
  return { text, busy, note, run, stop: () => ctl.current?.abort() };
}

function draftEmail(op, profile, matched) {
  const company = profile.companyName || "[Your company]";
  return `Subject: Enquiry: ${op.title}

Dear Procurement Team,

${company} is a ${profile.region}-based business offering ${matched.join(", ").toLowerCase() || "relevant services"}. We have reviewed the published information for "${op.title}" and would like to register our interest.

Could you please confirm:
- Whether the work will be packaged separately (e.g. supply vs. installation)
- Any outstanding specifications not included in the current documents
- The preferred format for supplier capability statements

${profile.certifications.length ? `We hold ${profile.certifications.join(", ")}.` : ""}

Kind regards,
[Your name]
${company}`;
}

export default function Opportunity({ id, profile, pipeline, setStage }) {
  const op = OPPORTUNITIES.find((o) => o.id === id);
  const [tab, setTab] = useState("brief");
  const [copied, setCopied] = useState(false);
  const [checks, setChecks] = useState({});
  const ai = useAI();
  const analysis = useAITask();
  const aiEmail = useAITask();

  if (!op) {
    return (
      <main className="section py-16 text-center">
        <p className="text-slate-600">That opportunity wasn't found.</p>
        <button className="btn-dark mt-4" onClick={() => go("/dashboard")}>Back to dashboard</button>
      </main>
    );
  }

  const s = scoreOpportunity(op, profile);
  const days = daysUntil(op.deadline);
  const email = aiEmail.text && !aiEmail.busy ? aiEmail.text : draftEmail(op, profile, s.matched);
  const checklist = [
    "Read full tender documents on the source portal",
    "Confirm scope split (supply / install)",
    ...op.certifications.map((c) => `Attach ${c} certificate`),
    "Prepare capability statement",
    "Price materials and labour",
    "Prepare insurance certificates (public liability, workers' comp)",
    days !== null ? `Submit before deadline (${days} days)` : "Set a reminder to check for a published tender",
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied("manual");
    }
  };

  return (
    <main className="section py-8">
      <button onClick={() => go("/dashboard")} className="text-sm text-slate-500 hover:text-slate-900">← Dashboard</button>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <KindBadge kind={op.kind} />
            <span className="chip">{op.sourceLabel}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{op.title}</h1>
          <p className="mt-1 text-slate-500">{op.buyer} · {op.location}</p>

          {op.kind === "signal" && (
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
              <strong>This is a prediction, not an available contract.</strong> It's based on a public announcement. Use it to start a
              conversation early, and we'll alert you if a formal tender is published.
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="card p-3"><p className="text-xs text-slate-500">Est. value</p><p className="font-bold">{formatMoney(op.value)}</p></div>
            <div className="card p-3"><p className="text-xs text-slate-500">Deadline</p><p className="font-bold">{days === null ? "None yet" : `${days} days`}</p></div>
            <div className="card p-3"><p className="text-xs text-slate-500">Distance</p><p className="font-bold">{op.distanceKm.toLocaleString()} km</p></div>
          </div>

          <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
            {[["brief", "AI analysis"], ["email", "AI enquiry email"], ["checklist", "Submission checklist"]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${tab === k ? "border-brand-500 text-slate-900" : "border-transparent text-slate-500"}`}>
                {l}
              </button>
            ))}
          </div>

          {tab === "brief" && (
            <div className="ai-panel mt-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-semibold text-white">
                  <Sparkle className="h-5 w-5 text-ai-cyan" /> AI bid analysis
                </p>
                <AIBadge live={!!ai} />
              </div>
              {!analysis.text && !analysis.busy && (
                <>
                  <p className="mt-2 text-sm text-slate-400">
                    The AI compares this opportunity with your profile and gives a bid / consider / skip verdict, risks, and the
                    questions to ask the buyer.
                  </p>
                  <button disabled={!ai} onClick={() => analysis.run(ai, analysisPrompt(op, profile, s))} className="btn-ai mt-4">
                    <Sparkle /> {ai ? "Analyse with AI" : "AI not connected in this view"}
                  </button>
                </>
              )}
              {analysis.busy && !analysis.text && <div className="mt-4"><AIThinking label="Reading the tender against your capabilities" /></div>}
              {analysis.text && <div className="mt-4"><AIText text={analysis.text} streaming={analysis.busy} /></div>}
              {analysis.busy && <button onClick={analysis.stop} className="mt-3 text-xs text-slate-400 hover:text-white">Stop</button>}
              {!analysis.busy && analysis.text && (
                <button onClick={() => analysis.run(ai, analysisPrompt(op, profile, s))} className="mt-3 text-xs font-medium text-ai-cyan hover:text-white">Run again</button>
              )}
              {analysis.note && <p className="mt-3 text-xs text-amber-300">{analysis.note}</p>}
            </div>
          )}

          {tab === "brief" && (
            <div className="card mt-4 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Extracted from the tender documents</p>
              <p className="text-sm text-slate-700">{op.summary}</p>
              <dl className="mt-4 divide-y divide-slate-100 text-sm">
                {Object.entries(op.extraction).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-3 py-2.5">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className={`col-span-2 font-medium ${v.startsWith("Not specified") ? "italic text-slate-400" : ""}`}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {tab === "email" && (
            <div className="card mt-4 p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {ai && (
                  <button disabled={aiEmail.busy} onClick={() => aiEmail.run(ai, emailPrompt(op, profile, s.matched))} className="btn-ai">
                    <Sparkle /> {aiEmail.busy ? "Writing…" : aiEmail.text ? "Rewrite with AI" : "Write it with AI"}
                  </button>
                )}
                <span className="text-xs text-slate-500">{aiEmail.text && !aiEmail.busy ? "Written by AI. Check before sending." : "Template draft"}</span>
              </div>
              {aiEmail.busy && !aiEmail.text && <div className="rounded-xl bg-navy-950 p-4"><AIThinking label="Drafting your enquiry" /></div>}
              {aiEmail.busy && aiEmail.text ? (
                <pre className="whitespace-pre-wrap rounded-xl bg-navy-950 p-4 font-sans text-sm text-slate-200">{aiEmail.text}<span className="ml-0.5 inline-block h-4 w-2 animate-blink bg-ai-cyan align-middle" /></pre>
              ) : (
                !aiEmail.busy && <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">{email}</pre>
              )}
              {aiEmail.note && <p className="mt-2 text-xs text-amber-700">{aiEmail.note}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={copy} disabled={aiEmail.busy} className="btn-dark">{copied === "manual" ? "Select the text to copy" : copied ? "Copied ✓" : "Copy draft"}</button>
                <p className="text-xs text-slate-500">OpportunityIQ never sends this for you. Review it, then send from your own email.</p>
              </div>
            </div>
          )}

          {tab === "checklist" && (
            <ul className="card mt-4 divide-y divide-slate-100">
              {checklist.map((c) => (
                <li key={c}>
                  <label className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-emerald-500" checked={!!checks[c]} onChange={() => setChecks((x) => ({ ...x, [c]: !x[c] }))} />
                    <span className={checks[c] ? "text-slate-400 line-through" : ""}>{c}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Your fit</p>
              <FitBadge score={s.score} />
            </div>
            <div className="mt-3"><FitBar score={s.score} /></div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-600">Why it matches</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {s.reasons.length ? s.reasons.map((r) => <li key={r}>✓ {r}</li>) : <li className="text-slate-500">No strong reasons found.</li>}
            </ul>
            {s.gaps.length > 0 && (
              <>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-amber-700">Check before bidding</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {s.gaps.map((g) => <li key={g}>⚠ {g}</li>)}
                </ul>
              </>
            )}
          </div>

          <div className="card p-5">
            <p className="font-semibold">Track this opportunity</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((st) => (
                <button key={st} onClick={() => setStage(op.id, pipeline[op.id] === st ? null : st)} className={`rounded-full px-3 py-1.5 text-sm ${pipeline[op.id] === st ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                  {st}
                </button>
              ))}
            </div>
            {pipeline[op.id] && (
              <button onClick={() => go("/pipeline")} className="mt-3 text-sm font-medium text-brand-600">View pipeline →</button>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
