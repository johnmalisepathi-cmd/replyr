import { formatSeconds } from "../lib/format.js";

function StatCard({ label, value, sub, accent, big }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-card ${
        accent
          ? "border-accent-200 bg-gradient-to-br from-accent-600 to-accent-700 text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className={`text-xs font-medium ${accent ? "text-accent-100" : "text-slate-500"}`}>
        {label}
      </div>
      <div
        className={`mt-1 font-bold tracking-tight ${big ? "text-4xl" : "text-3xl"} ${
          accent ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </div>
      {sub ? (
        <div className={`mt-1 text-xs ${accent ? "text-accent-100" : "text-slate-400"}`}>{sub}</div>
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
      className={`rounded-xl border px-4 py-3 ${
        highlight
          ? "border-accent-200 bg-accent-50"
          : alert
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`text-[11px] font-medium ${
          highlight ? "text-accent-700" : alert ? "text-rose-600" : "text-slate-500"
        }`}
      >
        {label}
      </div>
      <div
        className={`text-xl font-bold tracking-tight ${
          highlight ? "text-accent-700" : alert ? "text-rose-700" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function Dashboard({ stats }) {
  const caught = stats.caught;
  const captureRate = caught > 0 ? Math.round(((caught - 0) / caught) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
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

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-card">
        <p>
          <span className="font-semibold text-slate-700">Why this matters:</span> roughly half of
          customers go with whoever replies first. Replyr makes sure that's always you — instantly,
          accurately, and in your voice — even when you're with a customer, on a job, or asleep.
        </p>
      </div>
    </div>
  );
}
