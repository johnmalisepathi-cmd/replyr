import { useId } from "react";
import { go } from "../lib/router.js";
import { fitLabel } from "../lib/match.js";
import { CONTACT_EMAIL } from "../lib/config.js";

const PIN = "M24 5c-7.7 0-13.5 6-13.5 13.4C10.5 28.2 24 41 24 41s13.5-12.8 13.5-22.6C37.5 11 31.7 5 24 5z";

// The Gem Pin mark: a map pin cut into three facets, lit by an AI spark.
// `small` drops the fine facet lines so it stays crisp at icon sizes.
export function LogoMark({ className = "h-8 w-8", small = false }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`${id}l`}><polygon points="24,19 24,-10 -10,-10 -10,30 10,23" /></clipPath>
        <clipPath id={`${id}r`}><polygon points="24,19 24,-10 58,-10 58,30 38,23" /></clipPath>
        <clipPath id={`${id}p`}><path d={PIN} /></clipPath>
      </defs>
      <rect width="48" height="48" rx="12" fill="#122039" />
      <path d={PIN} fill="#5b4fd6" />
      <path d={PIN} fill="#a78bfa" clipPath={`url(#${id}l)`} />
      <path d={PIN} fill="#22d3ee" clipPath={`url(#${id}r)`} />
      {!small && (
        <g clipPath={`url(#${id}p)`} stroke="#e0f2fe" strokeOpacity="0.7" strokeWidth="0.9">
          <path d="M24 19 L24 4" />
          <path d="M24 19 L9 23.4" />
          <path d="M24 19 L39 23.4" />
          <path d="M24 19 L24 41" />
        </g>
      )}
      <path d="M24 13.5l1.6 3.9 3.9 1.6-3.9 1.6L24 24.5l-1.6-3.9-3.9-1.6 3.9-1.6z" fill="#e0f2fe" />
      {!small && <circle cx="24" cy="19" r="1.3" fill="#34d399" />}
    </svg>
  );
}

export function Logo({ compact = false }) {
  return (
    <button onClick={() => go("/")} className="flex items-center gap-2" aria-label="OpportunityIQ home">
      <LogoMark className="h-9 w-9" small />
      <span className={`${compact ? "hidden min-[400px]:inline" : ""} text-lg font-extrabold tracking-tight text-white`}>
        Opportunity<span className="text-ai-cyan">IQ</span>
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
            {link("/pipeline", "Pipeline")}
            {link("/onboarding", "Profile")}
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
              Join the pilot
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
        <strong>Demo mode.</strong> All opportunities, buyers and scores are fictional sample data. Nothing here is a
        live tender.
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

export function KindBadge({ kind }) {
  return kind === "tender" ? (
    <span className="rounded-full bg-navy-900 px-2.5 py-1 text-xs font-semibold text-white">Formal tender</span>
  ) : (
    <span className="rounded-full border border-dashed border-violet-400 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
      Early signal · not a contract
    </span>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-slate-400">
      <div className="section grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm">
            AI opportunity discovery and capability matching for businesses that make, build and supply.
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
              "Use the pilot form above"
            )}
          </p>
          <p className="mt-2">Pilot in Western Australia.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="section py-5 text-xs">
          © {new Date().getFullYear()} OpportunityIQ. Pre-launch. Features described are in development. OpportunityIQ
          does not guarantee contract wins and never contacts buyers or submits bids on your behalf.
        </div>
      </div>
    </footer>
  );
}
