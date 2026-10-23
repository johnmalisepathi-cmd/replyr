import { useState } from "react";

// "Why not just use ChatGPT?" — the comparison every visitor is thinking.
const COLS = ["Free tender portals", "ChatGPT / Claude", "OpportunityIQ"];

// Each cell: [level, text]. level: 2 = yes, 1 = partly, 0 = no.
const ROWS = [
  ["Finds new work without you asking", [1, "Keyword email alerts, per portal"], [0, "Only when you ask"], [2, "Checks every source daily"]],
  ["All sources in one place", [0, "One portal at a time"], [1, "Patchy web search"], [2, "Tenders, pipelines, planning, supplier pages"]],
  ["Knows what your business can do", [1, "Category codes"], [0, "Starts from scratch each chat"], [2, "Saved capability profile"]],
  ["Finds hidden work inside big tenders", [0, "Title and summary only"], [1, "If you find and upload the PDF"], [2, "Reads every document for you"]],
  ["Early signals before a tender exists", [0, "No"], [0, "Rarely"], [2, "Planning approvals and budgets flagged"]],
  ["Deadlines you can trust", [2, "Official source"], [0, "Can invent details"], [2, "Verified, with a source link"]],
  ["Explains why a job fits you", [0, "No"], [1, "If you write the right prompt"], [2, "Fit score with reasons and gaps"]],
  ["Pipeline, reminders and follow-ups", [0, "No"], [0, "No"], [2, "Built in"]],
];

function Mark({ level }) {
  const styles = [
    ["✕", "bg-white/5 text-slate-500"],
    ["~", "bg-amber-400/15 text-amber-300"],
    ["✓", "bg-brand-500/20 text-brand-300"],
  ];
  const [sym, cls] = styles[level];
  return (
    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cls}`} aria-label={["No", "Partly", "Yes"][level]}>
      {sym}
    </span>
  );
}

export default function WhyDifferent() {
  const [mobileCol, setMobileCol] = useState(1);

  return (
    <div className="space-y-10">
      {/* Desktop: full comparison table */}
      <div className="glass hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-5 py-4 font-medium text-slate-400">What you need</th>
              {COLS.map((c, i) => (
                <th key={c} className={`px-5 py-4 font-semibold ${i === 2 ? "bg-ai-violet/10 text-white" : "text-slate-300"}`}>
                  {i === 2 ? <span className="ai-text text-base">{c}</span> : c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([need, ...cells]) => (
              <tr key={need} className="border-b border-white/5 last:border-0">
                <th scope="row" className="px-5 py-3.5 font-medium text-white">{need}</th>
                {cells.map(([lvl, txt], i) => (
                  <td key={i} className={`px-5 py-3.5 ${i === 2 ? "bg-ai-violet/10 text-slate-100" : "text-slate-400"}`}>
                    <span className="flex items-start gap-2">
                      <Mark level={lvl} />
                      {txt}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: OpportunityIQ vs one chosen alternative */}
      <div className="md:hidden">
        <div className="flex gap-2" role="tablist" aria-label="Compare OpportunityIQ with">
          {[0, 1].map((i) => (
            <button
              key={i}
              role="tab"
              aria-selected={mobileCol === i}
              onClick={() => setMobileCol(i)}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ${mobileCol === i ? "bg-white text-navy-950" : "border border-white/20 text-slate-300"}`}
            >
              vs {COLS[i]}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {ROWS.map(([need, ...cells]) => (
            <li key={need} className="glass p-4">
              <p className="font-semibold text-white">{need}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{COLS[mobileCol]}</p>
                  <span className="flex items-start gap-1.5 text-slate-400"><Mark level={cells[mobileCol][0]} />{cells[mobileCol][1]}</span>
                </div>
                <div className="min-w-0 rounded-lg bg-ai-violet/10 p-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ai-violet">OpportunityIQ</p>
                  <span className="flex items-start gap-1.5 text-slate-100"><Mark level={cells[2][0]} />{cells[2][1]}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Your week, with and without */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Your week without it</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex gap-3"><span className="text-slate-600">✕</span>Log in to 6+ portals and council sites after work</li>
            <li className="flex gap-3"><span className="text-slate-600">✕</span>Open 180-page PDFs to find out it's not your kind of job</li>
            <li className="flex gap-3"><span className="text-slate-600">✕</span>Paste documents into ChatGPT, one at a time, and double-check every date</li>
            <li className="flex gap-3"><span className="text-slate-600">✕</span>Hear about the big project after competitors are already talking to the builder</li>
          </ul>
          <p className="mt-5 text-2xl font-extrabold text-slate-300">≈ 4 hours a week</p>
        </div>
        <div className="ai-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ai-cyan">Your week with OpportunityIQ</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            <li className="flex gap-3"><span className="text-ai-cyan">✓</span>7am email: "3 new jobs fit you, here's why"</li>
            <li className="flex gap-3"><span className="text-ai-cyan">✓</span>Each job already read, scored and summarised on one page</li>
            <li className="flex gap-3"><span className="text-ai-cyan">✓</span>Enquiry email and submission checklist drafted for you</li>
            <li className="flex gap-3"><span className="text-ai-cyan">✓</span>Early warning on approved projects, months before the tender</li>
          </ul>
          <p className="mt-5 text-2xl font-extrabold text-white">≈ 15 minutes a week</p>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">Time figures are typical estimates for a small workshop owner. Your experience will vary.</p>
    </div>
  );
}
