// Small formatting helpers used across the UI.

export function formatClock(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// "just now", "1 min", "3 mins", "1 hr" — for "time waiting" style labels.
export function formatAgo(ts, now = Date.now()) {
  const secs = Math.max(0, Math.floor((now - ts) / 1000));
  if (secs < 10) return "just now";
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"}`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr${hrs === 1 ? "" : "s"}`;
}

export function formatSeconds(secs) {
  if (secs == null) return "—";
  if (secs < 1) return "<1s";
  if (secs < 60) return `${secs.toFixed(secs < 10 ? 1 : 0)}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${Math.round(secs % 60)}s`;
}

export const URGENCY_STYLES = {
  high: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  medium: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  low: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
};

export const INTENT_LABELS = {
  quote_request: "Quote request",
  booking: "Booking",
  general_question: "Question",
  order: "Order",
};

export const CHANNEL_STYLES = {
  WhatsApp: "bg-green-500/15 text-green-300 ring-green-400/30",
  Email: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  "Instagram DM": "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-400/30",
  Facebook: "bg-blue-500/15 text-blue-300 ring-blue-400/30",
};
