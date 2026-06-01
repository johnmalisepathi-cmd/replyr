export default function Toasts({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-fade-in-up rounded-xl border p-3.5 backdrop-blur-xl ${
            t.tone === "nudge"
              ? "border-rose-400/40 bg-rose-500/10 shadow-glow-sm"
              : t.tone === "error"
              ? "border-rose-400/40 bg-rose-500/10"
              : "border-white/10 bg-ink-850/90 shadow-card"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none">{t.icon || "🔔"}</span>
            <div className="min-w-0 flex-1">
              {t.title ? <div className="text-sm font-semibold text-white">{t.title}</div> : null}
              <div className="text-sm text-slate-300">{t.text}</div>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-slate-500 transition hover:text-slate-300"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
