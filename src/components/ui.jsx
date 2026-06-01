// Small shared presentational helpers (dark AI theme).

export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

export function Avatar({ initials, color, size = "h-9 w-9" }) {
  return (
    <div
      className={`${size} ${color} flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-white/10`}
    >
      {initials}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

const baseInput =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-violet-500/15";

export function TextInput(props) {
  return <input {...props} className={`${baseInput} ${props.className || ""}`} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${baseInput} resize-none ${props.className || ""}`} />;
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`${baseInput} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2394a3b8%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10 [&>option]:bg-ink-850 [&>option]:text-slate-100 ${props.className || ""}`}
    />
  );
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {subtitle ? <p className="mt-1 max-w-xs text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

// A glowing gradient "spark" mark used for the AI presence.
export function SparkMark({ size = "h-9 w-9", className = "" }) {
  return (
    <span
      className={`${size} relative grid place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 text-white shadow-glow ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-1/2 w-1/2">
        <path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2zm6 11l.8 2.4L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.6L18 13zM6 14l.7 2L9 16.6l-2.3.7L6 19l-.7-1.7L3 16.6l2.3-.6L6 14z" />
      </svg>
    </span>
  );
}
