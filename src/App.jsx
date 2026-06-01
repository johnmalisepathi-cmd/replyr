import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import TopBar from "./components/TopBar.jsx";
import Onboarding from "./components/Onboarding.jsx";
import Inbox from "./components/Inbox.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Toasts from "./components/Toasts.jsx";
import {
  reducer,
  initialState,
  nextId,
  NUDGE_THRESHOLD_MS,
  selectOwnerQueue,
  selectStats,
} from "./lib/state.js";
import { generateResponse } from "./lib/ai.js";
import { DEMO_ENQUIRIES, CHANNELS } from "./lib/presets.js";
import { formatAgo } from "./lib/format.js";

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [channel, setChannel] = useState(CHANNELS[0]);
  // Keep latest business/apiKey accessible inside async AI calls without
  // re-binding handlers on every keystroke.
  const liveRef = useRef({ business: state.business, apiKey: state.apiKey });
  liveRef.current = { business: state.business, apiKey: state.apiKey };

  // ---- Toast helper (auto-dismiss) ----
  const addToast = useCallback((toast) => {
    const id = nextId("toast");
    dispatch({ type: "ADD_TOAST", toast: { id, ...toast } });
    setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), toast.sticky ? 9000 : 6000);
  }, []);

  // ---- Core AI loop ----
  const runAI = useCallback(
    async (id, customerMessage, history) => {
      const { business, apiKey } = liveRef.current;
      const start = Date.now();
      try {
        const { reply, lead } = await generateResponse({
          apiKey,
          business,
          customerMessage,
          history,
        });
        const responseSeconds = (Date.now() - start) / 1000;
        dispatch({
          type: "ENQUIRY_REPLIED",
          id,
          reply,
          lead,
          responseSeconds,
          ts: Date.now(),
          missRoll: Math.random(),
        });
        if (lead.needs_owner) {
          addToast({
            icon: "📲",
            title: "Owner notified",
            text: `${lead.customer_name || "A customer"} — ${lead.summary}`,
          });
        }
      } catch (err) {
        dispatch({ type: "ENQUIRY_ERROR", id, error: String(err.message || err) });
        addToast({ icon: "⚠️", tone: "error", title: "Reply failed", text: String(err.message || err) });
      }
    },
    [addToast]
  );

  // ---- Inject enquiries ----
  const fireEnquiry = useCallback(
    (channel, customerName, text) => {
      const id = nextId("enq");
      dispatch({ type: "ADD_ENQUIRY", id, channel, customerName, text, ts: Date.now() });
      runAI(id, text, []);
    },
    [runAI]
  );

  const handleSimulate = useCallback(() => {
    const pick = DEMO_ENQUIRIES[Math.floor(Math.random() * DEMO_ENQUIRIES.length)];
    fireEnquiry(pick.channel, pick.name, pick.text);
  }, [fireEnquiry]);

  const handleSend = useCallback(
    (channel, text) => {
      fireEnquiry(channel, "New enquiry", text);
    },
    [fireEnquiry]
  );

  const handleFollowUp = useCallback(
    (id, text) => {
      const convo = state.conversations.find((c) => c.id === id);
      const history = convo ? convo.messages : [];
      dispatch({ type: "ADD_CUSTOMER_MESSAGE", id, text, ts: Date.now() });
      runAI(id, text, history);
    },
    [state.conversations, runAI]
  );

  const handleHandled = useCallback(
    (id) => {
      dispatch({ type: "MARK_OWNER_HANDLED", id });
      addToast({ icon: "✅", text: "Lead marked as handled — nice." });
    },
    [addToast]
  );

  // ---- Demo timer: tick once a second so "time waiting" stays live ----
  useEffect(() => {
    const t = setInterval(() => dispatch({ type: "TICK", now: Date.now() }), 1000);
    return () => clearInterval(t);
  }, []);

  // ---- Owner-chasing nudge for leads sitting too long ----
  useEffect(() => {
    const queue = selectOwnerQueue(state);
    const overdue = queue.filter(
      (c) => state.now - c.createdAt > NUDGE_THRESHOLD_MS && !state.nudgedIds.includes(c.id)
    );
    if (overdue.length === 0) return;
    overdue.forEach((c) => dispatch({ type: "MARK_NUDGED", id: c.id }));
    const oldest = overdue[overdue.length - 1];
    addToast({
      icon: "⏰",
      tone: "nudge",
      sticky: true,
      title: "Don't lose this lead",
      text: `${queue.length} lead${queue.length === 1 ? "" : "s"} waiting — oldest ${formatAgo(
        oldest.createdAt,
        state.now
      )}.`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.now]);

  // ---- Derived ----
  const queue = selectOwnerQueue(state);
  const stats = selectStats(state);
  const selected = state.conversations.find((c) => c.id === state.selectedId) || null;

  return (
    <div className="min-h-full">
      <TopBar
        view={state.view}
        onView={(v) => dispatch({ type: "SET_VIEW", view: v })}
        apiKey={state.apiKey}
        onApiKey={(k) => dispatch({ type: "SET_API_KEY", apiKey: k })}
        business={state.business}
        waiting={stats.waiting}
      />

      <main className="pb-16">
        {state.view === "setup" ? (
          <Onboarding
            business={state.business}
            onboarded={state.onboarded}
            onChange={(patch) => dispatch({ type: "SET_BUSINESS", patch })}
            onReset={(b) => dispatch({ type: "RESET_BUSINESS", business: b })}
            onContinue={() => dispatch({ type: "COMPLETE_ONBOARDING" })}
          />
        ) : null}

        {state.view === "inbox" ? (
          <Inbox
            conversations={state.conversations}
            selected={selected}
            queue={queue}
            stats={stats}
            now={state.now}
            channel={channel}
            onChannel={setChannel}
            onSimulate={handleSimulate}
            onSend={handleSend}
            onSelect={(id) => dispatch({ type: "SELECT_CONVERSATION", id })}
            onFollowUp={handleFollowUp}
            onHandled={handleHandled}
          />
        ) : null}

        {state.view === "dashboard" ? <Dashboard stats={stats} /> : null}
      </main>

      <Toasts toasts={state.toasts} onDismiss={(id) => dispatch({ type: "REMOVE_TOAST", id })} />
    </div>
  );
}
