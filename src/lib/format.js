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
  high: "bg-rose-50 text-rose-700 ring-rose-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export const INTENT_LABELS = {
  quote_request: "Quote request",
  booking: "Booking",
  general_question: "Question",
  order: "Order",
};

export const CHANNEL_STYLES = {
  WhatsApp: "bg-green-50 text-green-700 ring-green-200",
  Email: "bg-sky-50 text-sky-700 ring-sky-200",
  "Instagram DM": "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  Facebook: "bg-blue-50 text-blue-700 ring-blue-200",
};
