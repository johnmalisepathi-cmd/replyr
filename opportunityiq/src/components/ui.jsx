import { useId } from "react";
import { go } from "../lib/router.js";
import { fitLabel } from "../lib/match.js";
import { CONTACT_EMAIL } from "../lib/config.js";

// The Signature logo: the Q's tail sweeps back under the whole name.
function Swoosh({ className }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 300 22" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}sw`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#8bc34a" />
          <stop offset="0.5" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M296 3 C 215 19, 95 18, 4 9" fill="none" stroke={`url(#${id}sw)`} strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// App-icon version: "IQ" with the same sweep, for tight spaces.
export function LogoMark({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#0b1530" stroke="#24375c" />
      <rect x="15" y="20" width="6" height="22" rx="1" fill="#f5f7fa" />
      <circle cx="37" cy="31" r="9.5" fill="none" stroke="#8bc34a" strokeWidth="5.5" />
      <path d="M41.5 35.5 L48 42" stroke="#8bc34a" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M51 49 C 41 55, 25 55, 13 51" fill="none" stroke="#8bc34a" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ compact = false }) {
  return (
    <button onClick={() => go("/")} className="flex items-center" aria-label="OpportunityIQ home">
      {compact && <LogoMark className="h-9 w-9 min-[400px]:hidden" />}
      <span className={`${compact ? "hidden min-[400px]:inline-flex" : "inline-flex"} flex-col items-stretch`}>
        <span className="font-brand text-[22px] font-semibold leading-none tracking-[-0.035em] text-white">
          Opportunity<span className="font-extrabold text-[#8bc34a]">IQ</span>
        </span>
        <Swoosh className="mt-px block h-[7px] w-full" />
      </span>
    </button>
  );
}

export function Nav({ route, hasProfile }) {
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
            {link("/dashboard", "Dashboard")}
            {link("/pipeline", "My plan")}
            {link("/onboarding", "Goals")}
          </nav>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => go(hasProfile ? "/dashboard" : "/onboarding")} className="btn hidden border border-white/20 text-white hover:bg-white/10 sm:inline-flex">
              Try the demo
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
    <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <div className="section py-2 text-xs sm:text-sm">
        <strong>Demo mode.</strong> Places, prices, listings and rates here are fictional sample data, so check before you book or buy.
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
            Your personal AI assistant. Tell it what you want, and it watches the world for you, 24/7.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Product</p>
          <ul className="mt-3 space-y-2">
            <li><button onClick={() => go("/onboarding")} className="hover:text-white">Interactive demo</button></li>
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
          © {new Date().getFullYear()} OpportunityIQ. Pre-launch. Features described are in development. OpportunityIQ
          never books, buys or pays on your behalf. Suggestions are general information, not financial advice.
        </div>
      </div>
    </footer>
  );
}
