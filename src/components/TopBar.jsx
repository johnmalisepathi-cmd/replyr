import { useState } from "react";
import { Badge } from "./ui.jsx";

const TABS = [
  { key: "setup", label: "Setup" },
  { key: "inbox", label: "Inbox" },
  { key: "dashboard", label: "Dashboard" },
];

export default function TopBar({ view, onView, apiKey, onApiKey, business, waiting }) {
  const [open, setOpen] = useState(false);
  const liveMode = Boolean(apiKey && apiKey.trim());

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => onView("inbox")}
          className="flex items-center gap-2.5"
          title="Replyr"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-lg font-black text-white shadow-sm">
            R
          </span>
          <div className="text-left leading-tight">
            <div className="text-[15px] font-bold tracking-tight text-slate-900">Replyr</div>
            <div className="text-[11px] font-medium text-slate-400">AI first responder</div>
          </div>
        </button>

        {/* Tabs */}
        <nav className="ml-2 hidden items-center gap-1 rounded-xl bg-slate-100 p-1 sm:flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onView(t.key)}
              className={`relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                view === t.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
              {t.key === "inbox" && waiting > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {waiting}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {business?.name ? (
            <span className="hidden text-sm text-slate-500 md:inline">
              {business.name} · <span className="text-slate-400">{business.type}</span>
            </span>
          ) : null}

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <span
              className={`h-2 w-2 rounded-full ${liveMode ? "bg-emerald-500" : "bg-amber-400"}`}
            />
            {liveMode ? "Live AI" : "Demo AI"}
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex gap-1 border-t border-slate-100 px-4 pb-2 pt-1 sm:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onView(t.key)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
              view === t.key ? "bg-accent-50 text-accent-700" : "text-slate-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* API key drawer */}
      {open ? (
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Anthropic API key</span>
                <Badge className={liveMode ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}>
                  {liveMode ? "Using real Claude" : "Using built-in Demo AI"}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="password"
                  value={apiKey}
                  placeholder="sk-ant-… (optional — leave blank to use Demo AI)"
                  onChange={(e) => onApiKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-100"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                >
                  Done
                </button>
              </div>
              <p className="text-xs text-slate-400">
                The key is held in React memory only (never stored) and used to call Claude
                directly from your browser. Without a key, Replyr runs a rule-based Demo AI so
                the full loop still works.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
