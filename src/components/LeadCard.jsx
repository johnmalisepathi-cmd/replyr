import { Badge, Avatar } from "./ui.jsx";
import { avatarFor } from "../lib/presets.js";
import { URGENCY_STYLES, INTENT_LABELS, CHANNEL_STYLES, formatAgo } from "../lib/format.js";

export default function LeadCard({ convo, now, onSelect, selected }) {
  const { lead } = convo;
  if (!lead) return null;
  const av = avatarFor(lead.customer_name || convo.customerName);

  return (
    <button
      onClick={() => onSelect(convo.id)}
      className={`w-full rounded-2xl border p-4 text-left backdrop-blur-xl transition ${
        selected
          ? "border-violet-400/40 bg-violet-500/10 shadow-glow-sm"
          : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar initials={av.initials} color={av.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-white">
              {lead.customer_name || convo.customerName}
            </span>
            <span className="shrink-0 text-xs text-slate-500">{formatAgo(convo.createdAt, now)}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-400">{lead.summary}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge className={CHANNEL_STYLES[convo.channel] || "bg-white/10 text-slate-300 ring-white/15"}>
              {convo.channel}
            </Badge>
            <Badge className="bg-white/10 text-slate-300 ring-white/15">
              {INTENT_LABELS[lead.intent] || lead.intent}
            </Badge>
            <Badge className={URGENCY_STYLES[lead.urgency] || URGENCY_STYLES.medium}>
              {lead.urgency} urgency
            </Badge>
            {lead.needs_owner ? (
              <Badge className="bg-violet-500/15 text-violet-300 ring-violet-400/30">needs you</Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-300 ring-emerald-400/30">handled by AI</Badge>
            )}
          </div>

          {lead.contact ? <div className="mt-2 text-xs text-slate-500">📇 {lead.contact}</div> : null}
        </div>
      </div>
    </button>
  );
}
