import { useState } from "react";
import { GOAL_TYPES } from "../lib/goals.js";
import { IndustryIcon } from "./ai-ui.jsx";

// Every kind of goal the assistant can watch. Tap one to see what it monitors.
export default function GoalTypeGrid() {
  const [openId, setOpenId] = useState("holiday");
  const open = GOAL_TYPES[openId];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(GOAL_TYPES).map(([id, g]) => {
          const active = id === openId;
          return (
            <li key={id}>
              <button
                onClick={() => setOpenId(id)}
                aria-pressed={active}
                className={`flex h-full w-full flex-col items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  active ? "border-ai-cyan bg-ai-cyan/10 shadow-ai-glow" : "border-white/10 bg-white/[0.03] hover:border-white/30"
                }`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? "bg-ai-cyan/15 text-ai-cyan" : "bg-white/5 text-slate-300"}`}>
                  <IndustryIcon id={id} className="h-7 w-7" />
                </span>
                <span className="text-sm font-semibold leading-snug text-white">{g.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <aside className="ai-panel h-fit p-5 lg:sticky lg:top-24" aria-live="polite">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ai-cyan/15 text-ai-cyan">
            <IndustryIcon id={openId} className="h-8 w-8" />
          </span>
          <p className="font-semibold text-white">{open.label}</p>
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ai-violet">Just say</p>
        <p className="mt-1 text-sm italic text-slate-200">"{open.example}"</p>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ai-violet">What the AI watches for you</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {open.watches.map((w) => (
            <span key={w} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-100">{w}</span>
          ))}
        </div>
      </aside>
    </div>
  );
}
