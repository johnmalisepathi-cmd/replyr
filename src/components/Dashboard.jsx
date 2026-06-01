import { formatSeconds } from "../lib/format.js";

function StatCard({ label, value, sub, accent, big }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 ${
        accent
          ? "border border-violet-400/30 bg-gradient-to-br from-violet-600/90 via-indigo-600/80 to-cyan-500/60 text-white shadow-glow"
          : "glass shadow-card"
      }`}
    >
      {accent ? (
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
      ) : null}
      <div className={`relative text-xs font-medium ${accent ? "text-violet-100" : "text-slate-400"}`}>
        {label}
      </div>
      <div
        className={`relative mt-1 font-bold tracking-tight ${big ? "text-4xl" : "text-3xl"} ${
          accent ? "text-white" : "text-white"
        }`}
      >
        {value}
      </div>
      {sub ? (
        <div className={`relative mt-1 text-xs ${accent ? "text-violet-100/90" : "text-slate-500"}`}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

export function StatStrip({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MiniStat label="Enquiries caught" value={stats.caught} />
      <MiniStat label="Avg response" value={formatSeconds(stats.avgResponse)} />
      <MiniStat label="Leads waiting" value={stats.waiting} alert={stats.waiting > 0} />
      <MiniStat label="Would've been missed" value={stats.wouldMiss} highlight />
    </div>
  );
}

function MiniStat({ label, value, alert, highlight }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 backdrop-blur-xl ${
        highlight
          ? "border-violet-400/30 bg-violet-500/10"
          : alert
          ? "border-rose-400/30 bg-rose-500/10"
          : "border-white/10 bg-white/[0.035]"
      }`}
    >
      <div
        className={`text-[11px] font-medium ${
          highlight ? "text-violet-300" : alert ? "text-rose-300" : "text-slate-400"
        }`}
      >
        {label}
      </div>
      <div
        className={`text-xl font-bold tracking-tight ${
          highlight ? "text-violet-200" : alert ? "text-rose-200" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function Dashboard({ stats }) {
  const caught = stats.caught;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          The value, at a glance: every enquiry answered instantly is one that didn't slip away.
        </p>
      </div>

      {/* Hero: caught vs would've-been-missed */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Enquiries caught"
          value={caught}
          sub="answered instantly, on-brand"
          accent
          big
        />
        <StatCard
          label="Would've been missed"
          value={stats.wouldMiss}
          sub="without an instant responder"
        />
        <StatCard
          label="Capture rate"
          value={caught > 0 ? "100%" : "—"}
          sub={caught > 0 ? `${stats.wouldMiss} of these were at-risk` : "no enquiries yet"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Average response time"
          value={formatSeconds(stats.avgResponse)}
          sub="speed-to-lead is everything"
        />
        <StatCard
          label="Leads waiting on you"
          value={stats.waiting}
          sub={stats.waiting > 0 ? "in your 'needs you' queue" : "all caught up 🎉"}
        />
      </div>

      <div className="glass mt-6 rounded-2xl p-5 text-sm text-slate-400 shadow-card">
        <p>
          <span className="font-semibold text-slate-200">Why this matters:</span> roughly half of
          customers go with whoever replies first. Replyr makes sure that's always you — instantly,
          accurately, and in your voice — even when you're with a customer, on a job, or asleep.
        </p>
      </div>
    </div>
  );
}
