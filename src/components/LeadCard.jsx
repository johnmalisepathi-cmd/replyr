import { Badge, Avatar } from "./ui.jsx";
import { avatarFor } from "../lib/presets.js";
import {
  URGENCY_STYLES,
  INTENT_LABELS,
  CHANNEL_STYLES,
  formatAgo,
} from "../lib/format.js";

export default function LeadCard({ convo, now, onSelect, selected }) {
  const { lead } = convo;
  if (!lead) return null;
  const av = avatarFor(lead.customer_name || convo.customerName);

  return (
    <button
      onClick={() => onSelect(convo.id)}
      className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-card ${
        selected ? "border-accent-300 ring-2 ring-accent-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar initials={av.initials} color={av.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-slate-900">
              {lead.customer_name || convo.customerName}
            </span>
            <span className="shrink-0 text-xs text-slate-400">{formatAgo(convo.createdAt, now)}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{lead.summary}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge className={CHANNEL_STYLES[convo.channel] || "bg-slate-50 text-slate-600 ring-slate-200"}>
              {convo.channel}
            </Badge>
            <Badge className="bg-slate-50 text-slate-600 ring-slate-200">
              {INTENT_LABELS[lead.intent] || lead.intent}
            </Badge>
            <Badge className={URGENCY_STYLES[lead.urgency] || URGENCY_STYLES.medium}>
              {lead.urgency} urgency
            </Badge>
            {lead.needs_owner ? (
              <Badge className="bg-accent-50 text-accent-700 ring-accent-200">needs you</Badge>
            ) : (
              <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">handled by AI</Badge>
            )}
          </div>

          {lead.contact ? (
            <div className="mt-2 text-xs text-slate-400">📇 {lead.contact}</div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
