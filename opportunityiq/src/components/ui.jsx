import { go } from "../lib/router.js";
import { fitLabel } from "../lib/match.js";
import { CONTACT_EMAIL } from "../lib/config.js";

export function Logo({ dark = false, compact = false }) {
  return (
    <button onClick={() => go("/")} className="flex items-center gap-2" aria-label="OpportunityIQ home">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={dark ? "#ffffff" : "#0b1426"} />
        <circle cx="16" cy="16" r="7" fill="none" stroke="#10b981" strokeWidth="3" />
        <circle cx="16" cy="16" r="2.5" fill="#10b981" />
      </svg>
      <span className={`${compact ? "hidden min-[400px]:inline" : ""} text-lg font-bold tracking-tight ${dark ? "text-white" : "text-navy-900"}`}>
        Opportunity<span className="text-brand-500">IQ</span>
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
        <Logo dark compact={inApp} />
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
          <Logo dark />
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
