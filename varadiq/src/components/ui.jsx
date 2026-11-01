import { go } from "../lib/router.js";
import { fitLabel } from "../lib/match.js";
import { CONTACT_EMAIL } from "../lib/config.js";
import Mandala from "./Mandala.jsx";
import { cloudEnabled } from "../lib/cloud.js";

// The VaradIQ logo: the V-mandala in front, then "Varad" + "IQ" in the logo's
// blue-to-green light. Varad (Sanskrit: a wish granted) + IQ.
export function LogoMark({ className = "h-9 w-9", gold = false }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-xl bg-navy-900 ${className}`}>
      <Mandala size={28} gold={gold} glow={false} />
    </span>
  );
}

export function Wordmark({ className = "text-[22px]", gold = false }) {
  return (
    <span className={`font-brand font-semibold leading-none tracking-[-0.03em] text-white ${className}`}>
      Varad
      <span className={`bg-clip-text font-extrabold text-transparent ${gold ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-200" : "bg-gradient-to-r from-blue-500 via-cyan-400 to-[#8bc34a]"}`}>IQ</span>
    </span>
  );
}

// compact: on narrow phones inside the app, show just the mandala so the menu fits.
export function Logo({ compact = false }) {
  return (
    <button onClick={() => go("/")} className="flex shrink-0 items-center gap-2" aria-label="VaradIQ home">
      <Mandala size={34} />
      <Wordmark className={`text-[22px] ${compact ? "hidden min-[420px]:inline" : ""}`} />
    </button>
  );
}

export function Nav({ route, hasProfile, user }) {
  const inApp = route !== "/" && route !== "/privacy";
  const link = (path, text) => (
    <button
      onClick={() => go(path)}
      className={`shrink-0 rounded-full px-2.5 py-1.5 text-sm font-medium transition sm:px-3 ${
        route.startsWith(path) ? "bg-white/15 text-white" : "text-slate-300 hover:text-white"
      }`}
    >
      {text}
    </button>
  );
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-950/90 backdrop-blur">
      <div className="section flex h-16 items-center justify-between gap-3">
        <Logo compact={inApp} />
        {inApp ? (
          <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1">
            {link("/dashboard", "Today")}
            {link("/onboarding", "Goals")}
            {link("/pipeline", "Saved")}
            {cloudEnabled && (
              <button
                onClick={() => go("/account")}
                aria-label={user ? `Account: ${user.email}` : "Sign in"}
                className={`ml-1 flex h-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${user ? "w-8 bg-brand-500 text-white" : "border border-white/25 px-3 text-white hover:bg-white/10"}`}
              >
                {user ? (user.email || "?")[0].toUpperCase() : "Sign in"}
              </button>
            )}
          </nav>
        ) : (
          <div className="flex items-center gap-2">
            {cloudEnabled && !user && (
              <button onClick={() => go("/account")} className="hidden text-sm font-medium text-slate-300 hover:text-white md:inline">Sign in</button>
            )}
            <button onClick={() => go(hasProfile ? "/dashboard" : "/onboarding")} className="btn hidden border border-white/20 text-white hover:bg-white/10 sm:inline-flex">
              Start free
            </button>
            <button
              onClick={() => document.getElementById("pilot")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-primary"
            >
              Get early access
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export function SampleBanner() {
  return (
    <div className="border-b border-white/10 bg-navy-900 text-slate-300">
      <div className="section flex items-start gap-2 py-2 text-xs sm:items-center sm:text-sm">
        <Mandala size={18} glow={false} className="mt-px shrink-0 sm:mt-0" />
        <p>
          <strong className="text-white">Early access.</strong> The AI is real. Places, prices and listings are examples while we
          connect live data, so check with the provider before you book or buy.
        </p>
      </div>
    </div>
  );
}

export function FitBar({ score, dark = false }) {
  const color = score >= 75 ? "bg-brand-500" : score >= 50 ? "bg-amber-400" : "bg-slate-300";
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-slate-100"}`} role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
    </div>
  );
}

// Circular progress for a goal (0-100).
export function ProgressRing({ value, size = 56, dark = false, label }) {
  const r = 15.5;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3.5" className={dark ? "stroke-white/10" : "stroke-slate-100"} />
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3.5" strokeLinecap="round" stroke={value >= 100 ? "#10b981" : "#8bc34a"} strokeDasharray={`${(c * Math.min(100, value)) / 100} ${c}`} className="transition-all duration-500" />
      </svg>
      <span className={`absolute text-[11px] font-bold tabular-nums ${dark ? "text-white" : "text-slate-800"}`} style={{ fontSize: size / 4.6 }}>{value >= 100 ? "✓" : `${value}%`}</span>
    </span>
  );
}

export function FitBadge({ score }) {
  const f = fitLabel(score);
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${f.tone}`}>{f.text} · {score}%</span>;
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-slate-400">
      <div className="section grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm">
            Your AI goal agent. Tell it a goal, and it plans it, watches it and keeps you moving until it's done. Varad (Sanskrit): a wish granted.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Product</p>
          <ul className="mt-3 space-y-2">
            <li><button onClick={() => go("/onboarding")} className="hover:text-white">Open the app</button></li>
            <li><button onClick={() => go("/privacy")} className="hover:text-white">Privacy & data sources</button></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Contact</p>
          <p className="mt-3">
            {CONTACT_EMAIL ? (
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">{CONTACT_EMAIL}</a>
            ) : (
              "Use the early-access form above"
            )}
          </p>
          <p className="mt-2">Early access now open.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="section py-5 text-xs">
          © {new Date().getFullYear()} VaradIQ. Pre-launch. Features described are in development. VaradIQ
          never books, buys or pays on your behalf. Suggestions are general information, not financial advice.
        </div>
      </div>
    </footer>
  );
}
