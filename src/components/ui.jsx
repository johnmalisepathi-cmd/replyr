// Small shared presentational helpers.

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
      className={`${size} ${color} flex shrink-0 items-center justify-center rounded-full text-xs font-semibold`}
    >
      {initials}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

const baseInput =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-accent-400 focus:ring-4 focus:ring-accent-100";

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
      className={`${baseInput} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2394a3b8%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${props.className || ""}`}
    />
  );
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 text-3xl">{icon}</div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {subtitle ? <p className="mt-1 max-w-xs text-xs text-slate-400">{subtitle}</p> : null}
    </div>
  );
}
