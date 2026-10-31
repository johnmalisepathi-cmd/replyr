import { useState } from "react";

// "Why not just ask ChatGPT or Google?" — the comparison every visitor is thinking.
const COLS = ["ChatGPT / Google", "To-do & alert apps", "OpportunityIQ"];

// Each cell: [level, text]. level: 2 = yes, 1 = partly, 0 = no.
const ROWS = [
  ["Makes a plan for your goal", [1, "Gives advice, then it's up to you"], [0, "You write every task"], [2, "Steps, dates and who does what"]],
  ["Works on it while you're away", [0, "Only when you ask"], [1, "Price drops only"], [2, "Prices, listings, bills, 24/7"]],
  ["Tells you what to do today", [0, "No"], [1, "Reminders you set"], [2, "Today's actions every morning"]],
  ["Finds the money", [0, "No"], [1, "Comparison sites, one bill at a time"], [2, "Cuts bills and sends the saving to your goal"]],
  ["Checks in until it's done", [0, "No"], [0, "No"], [2, "Weekly check-in, progress tracked"]],
  ["Real places and prices", [1, "Can make things up"], [2, "Yes"], [2, "With a link to the source"]],
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
  const [mobileCol, setMobileCol] = useState(0);

  return (
    <div className="space-y-10">
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Your week without it</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex gap-3"><span className="text-slate-600">✕</span>20 tabs open comparing flights and villas</li>
            <li className="flex gap-3"><span className="text-slate-600">✕</span>Paying too much on bills you never check</li>
            <li className="flex gap-3"><span className="text-slate-600">✕</span>Reading about interest rates without knowing what it means for you</li>
            <li className="flex gap-3"><span className="text-slate-600">✕</span>Goals that drift for months</li>
          </ul>
          <p className="mt-5 text-2xl font-extrabold text-slate-300">≈ 5 hours a week</p>
        </div>
        <div className="ai-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ai-cyan">Your week with OpportunityIQ</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            <li className="flex gap-3"><span className="text-ai-cyan">✓</span>A plan for every goal, with today's actions</li>
            <li className="flex gap-3"><span className="text-ai-cyan">✓</span>"Bali flights down 22%. Book this week."</li>
            <li className="flex gap-3"><span className="text-ai-cyan">✓</span>"4 of 6 steps done. Next: book the villa."</li>
            <li className="flex gap-3"><span className="text-ai-cyan">✓</span>"$990 a year cut from your bills, sent to Bali"</li>
          </ul>
          <p className="mt-5 text-2xl font-extrabold text-white">≈ 15 minutes a week</p>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">Time figures are typical estimates. Your experience will vary.</p>
    </div>
  );
}
