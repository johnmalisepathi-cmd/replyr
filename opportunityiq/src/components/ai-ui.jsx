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
  construction: (
    <>
      <path d="M10 42V8h4l20 6H14M14 14v28M8 42h14" />
      <path d="M30 14v8M27 22h6v5h-6z" />
    </>
  ),
  painting: (
    <>
      <rect x="8" y="8" width="28" height="12" rx="2" />
      <path d="M36 14h4v10H24v6M22 30h4v12h-4z" />
    </>
  ),
  electrical: <path d="M27 4L11 27h12l-3 17 17-24H25l2-16z" />,
  plumbing: (
    <>
      <path d="M8 14h16v8h10v18h-8V30h-6v-8H8z" />
      <path d="M8 10v8M16 6v6" />
    </>
  ),
  landscaping: (
    <>
      <path d="M24 44V22" />
      <path d="M24 30c-8 0-12-6-12-12 6 0 12 4 12 12zM24 24c0-8 5-14 12-14 0 8-5 14-12 14z" />
      <path d="M10 44h28" />
    </>
  ),
  furniture: (
    <>
      <path d="M12 22V10h24v12M8 22h32v8H8zM12 30v10M36 30v10" />
    </>
  ),
  defence: <path d="M24 4l16 6v12c0 10-7 17-16 22-9-5-16-12-16-22V10z" />,
  chemicals: (
    <>
      <path d="M18 6h12M20 6v12L9 38a3 3 0 003 4h24a3 3 0 003-4L28 18V6" />
      <path d="M14 30h20" />
    </>
  ),
  oilgas: (
    <>
      <path d="M24 6c6 9 12 15 12 23a12 12 0 01-24 0c0-8 6-14 12-23z" />
      <path d="M19 32a5 5 0 005 5" />
    </>
  ),
  energy: (
    <>
      <path d="M24 26v18M18 44h12" />
      <path d="M24 26L14 8M24 26l18-4M24 26L12 34" />
      <circle cx="24" cy="26" r="2.5" />
    </>
  ),
  environmental: (
    <>
      <path d="M16 12l4-6h8l4 6M38 24l2 7-4 6h-7M10 24l-2 7 4 6h7" />
      <path d="M30 10l2 4-4 1M34 37l-4 2 1-4M14 37l-1-4 4 2" />
    </>
  ),
  automotive: (
    <>
      <path d="M6 30v-6l5-10h26l5 10v6z" />
      <circle cx="14" cy="32" r="4" />
      <circle cx="34" cy="32" r="4" />
      <path d="M12 22h24" />
    </>
  ),
  marine: (
    <>
      <path d="M24 6v28M24 10l12 18H24" />
      <path d="M6 34h36l-5 8H11z" />
    </>
  ),
  agriculture: (
    <>
      <path d="M24 44V12" />
      <path d="M24 18c-5 0-8-3-8-8 5 0 8 3 8 8zM24 18c5 0 8-3 8-8-5 0-8 3-8 8zM24 28c-5 0-8-3-8-8 5 0 8 3 8 8zM24 28c5 0 8-3 8-8-5 0-8 3-8 8z" />
    </>
  ),
  hospitality: (
    <>
      <path d="M8 34h32M10 34a14 14 0 0128 0" />
      <path d="M24 16v4M6 40h36" />
    </>
  ),
  cleaning: (
    <>
      <path d="M30 6l-8 18M14 24h16l4 18H10z" />
      <path d="M16 32v8M22 32v8M28 32v8" />
    </>
  ),
  security: (
    <>
      <rect x="12" y="20" width="24" height="20" rx="3" />
      <path d="M17 20v-6a7 7 0 0114 0v6M24 28v5" />
    </>
  ),
  labour: (
    <>
      <path d="M10 26a14 14 0 0128 0M8 26h32v4H8z" />
      <path d="M24 12v6M24 36v6" />
    </>
  ),
  it: (
    <>
      <rect x="6" y="8" width="36" height="24" rx="2" />
      <path d="M18 18l-4 4 4 4M30 18l4 4-4 4M26 16l-4 12M16 40h16" />
    </>
  ),
  telecoms: (
    <>
      <path d="M24 20l-8 24M24 20l8 24M18 36h12" />
      <circle cx="24" cy="16" r="3" />
      <path d="M14 8a14 14 0 000 16M34 8a14 14 0 010 16" />
    </>
  ),
  professional: (
    <>
      <rect x="6" y="14" width="36" height="26" rx="3" />
      <path d="M18 14v-4h12v4M6 26h36" />
    </>
  ),
  healthcare: <path d="M19 8h10v11h11v10H29v11H19V29H8V19h11z" />,
  education: (
    <>
      <path d="M4 18l20-10 20 10-20 10z" />
      <path d="M12 22v10c0 3 5 6 12 6s12-3 12-6V22M40 20v12" />
    </>
  ),
  community: (
    <>
      <circle cx="16" cy="14" r="5" />
      <circle cx="32" cy="14" r="5" />
      <path d="M6 38c0-7 4-12 10-12s10 5 10 12M22 38c0-7 4-12 10-12s10 5 10 12" />
    </>
  ),
  marketing: (
    <>
      <path d="M8 20v8h6l16 10V10L14 20z" />
      <path d="M36 18a8 8 0 010 12M14 28l3 10h5l-3-10" />
    </>
  ),
  supplies: (
    <>
      <path d="M24 4l18 9v22l-18 9-18-9V13z" />
      <path d="M6 13l18 9 18-9M24 22v22" />
    </>
  ),
};

export function IndustryIcon({ id, className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[id] || <circle cx="24" cy="24" r="14" />}
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
