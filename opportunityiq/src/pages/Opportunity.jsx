import { useState } from "react";
import { go } from "../lib/router.js";
import { OPPORTUNITIES, PIPELINE_STAGES } from "../lib/data.js";
import { daysUntil, formatMoney, scoreOpportunity } from "../lib/match.js";
import { FitBadge, FitBar, KindBadge } from "../components/ui.jsx";

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
  const email = draftEmail(op, profile, s.matched);
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
      setCopied(false);
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
            {[["brief", "AI brief"], ["email", "Draft enquiry"], ["checklist", "Submission checklist"]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${tab === k ? "border-brand-500 text-slate-900" : "border-transparent text-slate-500"}`}>
                {l}
              </button>
            ))}
          </div>

          {tab === "brief" && (
            <div className="card mt-4 p-5">
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
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">{email}</pre>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button onClick={copy} className="btn-dark">{copied ? "Copied ✓" : "Copy draft"}</button>
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
