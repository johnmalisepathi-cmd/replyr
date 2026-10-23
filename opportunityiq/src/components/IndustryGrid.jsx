import { useState } from "react";
import { INDUSTRIES, INDUSTRY_GROUPS } from "../lib/data.js";
import { IndustryIcon } from "./ai-ui.jsx";

// Every industry, filterable by group. Tapping a card shows what the AI
// looks for in that industry.
export default function IndustryGrid() {
  const [group, setGroup] = useState("All");
  const [openId, setOpenId] = useState("steel");
  const list = Object.entries(INDUSTRIES).filter(([, i]) => group === "All" || i.group === group);
  const open = INDUSTRIES[openId];

  return (
    <div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Industry groups">
        {["All", ...INDUSTRY_GROUPS].map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={group === g}
            onClick={() => setGroup(g)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${group === g ? "bg-white text-navy-950" : "border border-white/15 text-slate-300 hover:border-ai-cyan"}`}
          >
            {g}
            {g === "All" && ` · ${Object.keys(INDUSTRIES).length}`}
          </button>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {list.map(([id, ind]) => {
            const active = id === openId;
            return (
              <li key={id}>
                <button
                  onClick={() => setOpenId(id)}
                  aria-pressed={active}
                  className={`flex h-full w-full flex-col items-start gap-3 rounded-2xl border p-4 text-left transition ${
                    active ? "border-ai-cyan bg-ai-cyan/10 shadow-ai-glow" : ind.pilot ? "border-brand-400/40 bg-brand-500/[0.07] hover:border-brand-300" : "border-white/10 bg-white/[0.03] hover:border-white/30"
                  }`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${ind.pilot ? "bg-brand-500/15 text-brand-300" : active ? "bg-ai-cyan/15 text-ai-cyan" : "bg-white/5 text-slate-400"}`}>
                    <IndustryIcon id={id} className="h-7 w-7" />
                  </span>
                  <span className="text-sm font-semibold leading-snug text-white">{ind.label}</span>
                  {ind.pilot && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">Pilot now</span>}
                </button>
              </li>
            );
          })}
        </ul>

        {open && (
          <aside className="ai-panel h-fit p-5 lg:sticky lg:top-24" aria-live="polite">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ai-cyan/15 text-ai-cyan">
                <IndustryIcon id={openId} className="h-8 w-8" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-white">{open.label}</p>
                <p className="text-xs text-slate-400">{open.group} · {open.pilot ? "In the WA pilot now" : "Join the waitlist"}</p>
              </div>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ai-violet">Example opportunities</p>
            <p className="mt-1 text-sm text-slate-200">{open.examples}</p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ai-violet">What the AI matches on</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {open.capabilities.map((c) => (
                <span key={c} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-100">{c}</span>
              ))}
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ai-violet">Certifications it checks</p>
            <p className="mt-1 text-sm text-slate-300">{open.certifications.join(" · ")}</p>
            <p className="mt-4 text-xs text-slate-500">Also weighs: {open.factors.toLowerCase()}.</p>
          </aside>
        )}
      </div>
    </div>
  );
}
