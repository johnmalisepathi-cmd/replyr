export default function Toasts({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-fade-in-up rounded-xl border p-3.5 shadow-card ${
            t.tone === "nudge"
              ? "border-rose-200 bg-white"
              : t.tone === "error"
              ? "border-rose-200 bg-rose-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none">{t.icon || "🔔"}</span>
            <div className="min-w-0 flex-1">
              {t.title ? (
                <div className="text-sm font-semibold text-slate-900">{t.title}</div>
              ) : null}
              <div className="text-sm text-slate-600">{t.text}</div>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-slate-300 transition hover:text-slate-500"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
