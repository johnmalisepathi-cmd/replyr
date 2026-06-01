import { useState } from "react";
import { Badge, Avatar, EmptyState, Select } from "./ui.jsx";
import OwnerQueue from "./OwnerQueue.jsx";
import { StatStrip } from "./Dashboard.jsx";
import { avatarFor, CHANNELS } from "../lib/presets.js";
import {
  URGENCY_STYLES,
  INTENT_LABELS,
  CHANNEL_STYLES,
  formatAgo,
  formatClock,
  formatSeconds,
} from "../lib/format.js";

// ---------------------------------------------------------------------------
// Controls to inject enquiries (the "wow" trigger)
// ---------------------------------------------------------------------------

function SimulateControls({ channel, onChannel, onSimulate, onSend }) {
  const [text, setText] = useState("");

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(channel, t);
    setText("");
  };

  return (
    <div className="border-b border-slate-100 p-3">
      <button
        onClick={onSimulate}
        className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
      >
        ⚡ Simulate incoming enquiry
      </button>

      <div className="flex gap-2">
        <Select
          value={channel}
          onChange={(e) => onChannel(e.target.value)}
          className="w-36 shrink-0 py-2 text-xs"
        >
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <input
          value={text}
          placeholder="Type a customer message…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-100"
        />
        <button
          onClick={send}
          className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feed row (left column)
// ---------------------------------------------------------------------------

function FeedRow({ convo, now, selected, onSelect }) {
  const name = convo.lead?.customer_name || convo.customerName;
  const av = avatarFor(name);
  const last = convo.messages[convo.messages.length - 1];
  return (
    <button
      onClick={() => onSelect(convo.id)}
      className={`flex w-full items-start gap-2.5 border-b border-slate-50 px-3 py-3 text-left transition hover:bg-slate-50 ${
        selected ? "bg-accent-50/60" : ""
      }`}
    >
      <Avatar initials={av.initials} color={av.color} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-slate-900">{name}</span>
          <span className="shrink-0 text-[11px] text-slate-400">{formatAgo(convo.createdAt, now)}</span>
        </div>
        <p className="truncate text-xs text-slate-500">
          {convo.status === "replying" && last.role === "customer" ? (
            <span className="italic text-slate-400">{last.text}</span>
          ) : (
            last.text
          )}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <Badge className={CHANNEL_STYLES[convo.channel] || "bg-slate-50 text-slate-600 ring-slate-200"}>
            {convo.channel}
          </Badge>
          {convo.status === "replying" ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-accent-600">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent-500" />
              replying…
            </span>
          ) : convo.status === "error" ? (
            <span className="text-[11px] font-medium text-rose-600">error</span>
          ) : convo.lead?.needs_owner ? (
            <Badge className="bg-accent-50 text-accent-700 ring-accent-200">needs you</Badge>
          ) : (
            <span className="text-[11px] font-medium text-emerald-600">✓ handled</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Chat thread (center) + structured lead card
// ---------------------------------------------------------------------------

function MessageBubble({ msg }) {
  const isAi = msg.role === "ai";
  return (
    <div className={`flex ${isAi ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[80%]">
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
            isAi
              ? "rounded-br-md bg-accent-600 text-white"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
          }`}
        >
          {msg.text}
        </div>
        <div className={`mt-1 text-[11px] text-slate-400 ${isAi ? "text-right" : "text-left"}`}>
          {isAi ? "Replyr AI" : "Customer"} · {formatClock(msg.ts)}
        </div>
      </div>
    </div>
  );
}

function LeadDetail({ lead }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Captured lead
        </span>
        {lead.needs_owner ? (
          <Badge className="bg-accent-50 text-accent-700 ring-accent-200">routed to owner</Badge>
        ) : (
          <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">handled by AI</Badge>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Detail label="Name" value={lead.customer_name || "—"} />
        <Detail label="Contact" value={lead.contact || "—"} />
        <Detail label="Intent" value={INTENT_LABELS[lead.intent] || lead.intent} />
        <div>
          <dt className="text-xs text-slate-400">Urgency</dt>
          <dd className="mt-0.5">
            <Badge className={URGENCY_STYLES[lead.urgency]}>{lead.urgency}</Badge>
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-slate-400">Summary</dt>
          <dd className="mt-0.5 text-slate-800">{lead.summary}</dd>
        </div>
      </dl>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-0.5 truncate font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function ChatThread({ convo, onFollowUp }) {
  const [text, setText] = useState("");
  if (!convo) {
    return (
      <EmptyState
        icon="💬"
        title="Pick an enquiry — or simulate one"
        subtitle="Hit “Simulate incoming enquiry” or type a customer message to watch Replyr answer instantly."
      />
    );
  }

  const firstAi = convo.messages.find((m) => m.role === "ai");
  const send = () => {
    const t = text.trim();
    if (!t) return;
    onFollowUp(convo.id, t);
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {convo.lead?.customer_name || convo.customerName}
          </span>
          <Badge className={CHANNEL_STYLES[convo.channel] || "bg-slate-50 text-slate-600 ring-slate-200"}>
            {convo.channel}
          </Badge>
          <Badge className="bg-slate-100 text-slate-500 ring-slate-200">Demo</Badge>
        </div>
        {convo.responseSeconds != null ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            ⚡ replied in {formatSeconds(convo.responseSeconds)}
          </span>
        ) : null}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {convo.messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}

        {convo.status === "replying" ? (
          <div className="flex justify-end">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-br-md bg-accent-600 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-white" />
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-white [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-white [animation-delay:0.4s]" />
            </div>
          </div>
        ) : null}

        {convo.status === "error" ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <div className="font-semibold">Couldn't generate a reply</div>
            <div className="mt-0.5 text-xs">{convo.error}</div>
          </div>
        ) : null}

        {convo.lead ? <LeadDetail lead={convo.lead} /> : null}
      </div>

      {/* Follow-up composer */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <input
            value={text}
            placeholder="Reply as the customer (follow-up turn)…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-100"
          />
          <button
            onClick={send}
            disabled={convo.status === "replying"}
            className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inbox shell
// ---------------------------------------------------------------------------

export default function Inbox({
  conversations,
  selected,
  queue,
  stats,
  now,
  channel,
  onChannel,
  onSimulate,
  onSend,
  onSelect,
  onFollowUp,
  onHandled,
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <div className="mb-4">
        <StatStrip stats={stats} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Feed */}
        <section className="lg:col-span-4">
          <div className="flex h-[72vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="flex items-center justify-between px-4 pt-3">
              <h2 className="text-sm font-semibold text-slate-900">Live enquiries</h2>
              <span className="text-xs text-slate-400">{conversations.length} total</span>
            </div>
            <SimulateControls
              channel={channel}
              onChannel={onChannel}
              onSimulate={onSimulate}
              onSend={onSend}
            />
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <EmptyState
                  icon="📨"
                  title="No enquiries yet"
                  subtitle="Simulate one above to see Replyr answer instantly."
                />
              ) : (
                conversations.map((c) => (
                  <FeedRow
                    key={c.id}
                    convo={c}
                    now={now}
                    selected={selected?.id === c.id}
                    onSelect={onSelect}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Thread */}
        <section className="lg:col-span-5">
          <div className="h-[72vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/40 shadow-card">
            <ChatThread convo={selected} onFollowUp={onFollowUp} />
          </div>
        </section>

        {/* Owner queue */}
        <section className="lg:col-span-3">
          <div className="h-[72vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <OwnerQueue queue={queue} now={now} onHandled={onHandled} onSelect={onSelect} />
          </div>
        </section>
      </div>
    </div>
  );
}
