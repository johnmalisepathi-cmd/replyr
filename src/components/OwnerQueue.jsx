import { Badge, Avatar, EmptyState } from "./ui.jsx";
import { avatarFor } from "../lib/presets.js";
import { URGENCY_STYLES, formatAgo } from "../lib/format.js";
import { NUDGE_THRESHOLD_MS } from "../lib/state.js";

export default function OwnerQueue({ queue, now, onHandled, onSelect }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Needs you</h2>
          {queue.length > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
              {queue.length}
            </span>
          ) : null}
        </div>
        <span className="text-xs text-slate-400">owner handoffs</span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {queue.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No leads waiting"
            subtitle="When the AI hands one off, it lands here for you to action."
          />
        ) : (
          queue.map((c) => {
            const av = avatarFor(c.lead.customer_name || c.customerName);
            const overdue = now - c.createdAt > NUDGE_THRESHOLD_MS;
            return (
              <div
                key={c.id}
                className={`rounded-xl border p-3 transition ${
                  overdue ? "border-rose-200 bg-rose-50/60" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Avatar initials={av.initials} color={av.color} size="h-8 w-8" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelect(c.id)}
                        className="truncate text-sm font-semibold text-slate-900 hover:text-accent-700"
                      >
                        {c.lead.customer_name || c.customerName}
                      </button>
                      <span
                        className={`shrink-0 text-xs font-medium ${
                          overdue ? "text-rose-600" : "text-slate-400"
                        }`}
                      >
                        {overdue ? "⏰ " : ""}
                        {formatAgo(c.createdAt, now)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{c.lead.summary}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge className={URGENCY_STYLES[c.lead.urgency]}>{c.lead.urgency}</Badge>
                      {c.lead.contact ? (
                        <span className="text-xs text-slate-400">{c.lead.contact}</span>
                      ) : (
                        <span className="text-xs text-slate-300">no contact given</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onHandled(c.id)}
                  className="mt-2.5 w-full rounded-lg bg-slate-900 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  Mark as handled
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
