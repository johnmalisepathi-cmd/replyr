import { Fragment } from "react";

// Renders the small markdown subset the AI writes: "## " headings,
// "- " bullets and **bold**. Built from React nodes, never innerHTML.
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function AIText({ text, streaming = false, className = "" }) {
  const blocks = [];
  let list = null;
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    const bullet = line.match(/^([-*•]|\d+\.)\s+(.*)/);
    if (bullet) {
      if (!list) blocks.push((list = { type: "ul", items: [], key: i }));
      list.items.push(bullet[2]);
      return;
    }
    list = null;
    if (!line) return;
    if (line.startsWith("#")) blocks.push({ type: "h", text: line.replace(/^#+\s*/, ""), key: i });
    else blocks.push({ type: "p", text: line, key: i });
  });

  return (
    <div className={`space-y-2.5 text-sm leading-relaxed text-slate-300 ${className}`}>
      {blocks.map((b) =>
        b.type === "ul" ? (
          <ul key={b.key} className="space-y-1.5">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ai-cyan" />
                <span>{inline(it)}</span>
              </li>
            ))}
          </ul>
        ) : b.type === "h" ? (
          <p key={b.key} className="pt-1 text-xs font-bold uppercase tracking-wider text-ai-violet">{b.text}</p>
        ) : (
          <p key={b.key}>{inline(b.text)}</p>
        )
      )}
      {streaming && <span className="inline-block h-4 w-2 translate-y-0.5 animate-blink bg-ai-cyan" aria-hidden="true" />}
    </div>
  );
}

export function AIThinking({ label = "Thinking" }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300" role="status">
      <span className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-dot rounded-full bg-ai-cyan" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      {label}…
    </div>
  );
}

export function AIBadge({ live }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ai-violet/40 bg-ai-violet/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ai-violet">
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "animate-glow bg-ai-cyan" : "bg-slate-500"}`} />
      {live ? "Live AI" : "Quick matcher"}
    </span>
  );
}

export function Sparkle({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 5.6L19.5 9.5l-5.7 1.9L12 17l-1.8-5.6L4.5 9.5l5.7-1.9L12 2zm7 11l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 13z" />
    </svg>
  );
}

// Line-art industry icons, drawn on a 48px grid.
const ICONS = {
  steel: (
    <>
      <path d="M10 10h28M10 38h28M24 10v28" />
      <path d="M14 10v4M34 10v4M14 38v-4M34 38v-4" />
    </>
  ),
  engineering: (
    <>
      <circle cx="24" cy="24" r="6" />
      <path d="M24 8v6M24 34v6M8 24h6M34 24h6M12.7 12.7l4.2 4.2M31.1 31.1l4.2 4.2M12.7 35.3l4.2-4.2M31.1 16.9l4.2-4.2" />
    </>
  ),
  mining: (
    <>
      <path d="M6 30h26l4-10h6v10" />
      <path d="M10 30l4-12h14l4 12" />
      <circle cx="14" cy="34" r="4" />
      <circle cx="34" cy="34" r="4" />
    </>
  ),
  textiles: <path d="M18 8l-10 6 4 7 4-2v21h16V19l4 2 4-7-10-6c0 3-3 5-6 5s-6-2-6-5z" />,
  food: (
    <>
      <path d="M10 18h28l-3 20H13z" />
      <path d="M16 18c0-5 3-9 8-9s8 4 8 9" />
      <path d="M18 26h12" />
    </>
  ),
  logistics: (
    <>
      <path d="M4 14h24v18H4zM28 20h9l7 7v5H28z" />
      <circle cx="12" cy="35" r="3.5" />
      <circle cx="36" cy="35" r="3.5" />
    </>
  ),
};

export function IndustryIcon({ id, className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[id]}
    </svg>
  );
}

// A tender page being read by the AI: a scan line sweeps the document while
// the fields it pulls out light up one after another.
export function DocScan({ fields }) {
  const rows = Object.entries(fields).slice(0, 6);
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tender_RFT-2291.pdf</span>
          <span>p. 47 / 180</span>
        </div>
        <div className="space-y-2" aria-hidden="true">
          {[92, 80, 86, 40, 0, 95, 70, 88, 60, 0, 90, 76, 84, 52].map((w, i) =>
            w ? (
              <div key={i} className={`h-1.5 rounded-full ${[2, 6, 11].includes(i) ? "bg-ai-cyan/50" : "bg-white/10"}`} style={{ width: `${w}%` }} />
            ) : (
              <div key={i} className="h-2" />
            )
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 h-10 animate-scan" aria-hidden="true">
          <div className="h-full bg-gradient-to-b from-transparent via-ai-cyan/25 to-transparent" />
          <div className="-mt-5 h-px bg-ai-cyan shadow-[0_0_12px_2px_rgba(34,211,238,0.8)]" />
        </div>
      </div>
      <dl className="space-y-2">
        {rows.map(([k, v], i) => (
          <div key={k} className="glass flex animate-glow flex-col gap-0.5 px-3 py-2" style={{ animationDelay: `${i * 0.4}s` }}>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-ai-violet">{k}</dt>
            <dd className={`text-sm ${v.startsWith("Not specified") ? "italic text-slate-500" : "text-slate-100"}`}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
