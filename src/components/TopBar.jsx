import { useState } from "react";
import { Badge, SparkMark } from "./ui.jsx";

const TABS = [
  { key: "setup", label: "Setup" },
  { key: "inbox", label: "Inbox" },
  { key: "dashboard", label: "Dashboard" },
];

export default function TopBar({ view, onView, apiKey, onApiKey, business, waiting }) {
  const [open, setOpen] = useState(false);
  const liveMode = Boolean(apiKey && apiKey.trim());

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Brand */}
        <button onClick={() => onView("inbox")} className="flex items-center gap-2.5" title="Replyr">
          <SparkMark />
          <div className="text-left leading-tight">
            <div className="text-[15px] font-bold tracking-tight text-white">Replyr</div>
            <div className="text-[11px] font-medium text-slate-400">AI first responder</div>
          </div>
        </button>

        {/* Tabs */}
        <nav className="ml-2 hidden items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 sm:flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onView(t.key)}
              className={`relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                view === t.key
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {t.label}
              {t.key === "inbox" && waiting > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-glow">
                  {waiting}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {business?.name ? (
            <span className="hidden text-sm text-slate-400 md:inline">
              {business.name} · <span className="text-slate-500">{business.type}</span>
            </span>
          ) : null}

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                liveMode ? "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]" : "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.6)]"
              }`}
            />
            {liveMode ? "Live AI" : "Demo AI"}
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex gap-1 border-t border-white/10 px-4 pb-2 pt-1 sm:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onView(t.key)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
              view === t.key ? "bg-white/10 text-white" : "text-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* API key drawer */}
      {open ? (
        <div className="border-t border-white/10 bg-ink-900/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-100">Anthropic API key</span>
                <Badge
                  className={
                    liveMode
                      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                      : "bg-amber-500/15 text-amber-300 ring-amber-400/30"
                  }
                >
                  {liveMode ? "Using real Claude" : "Using built-in Demo AI"}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="password"
                  value={apiKey}
                  placeholder="sk-ant-… (optional — leave blank to use Demo AI)"
                  onChange={(e) => onApiKey(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/15"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="btn-accent shrink-0 px-4 py-2.5 text-sm font-semibold"
                >
                  Done
                </button>
              </div>
              <p className="text-xs text-slate-500">
                The key is held in React memory only (never stored) and used to call Claude directly
                from your browser. Without a key, Replyr runs a rule-based Demo AI so the full loop
                still works.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
