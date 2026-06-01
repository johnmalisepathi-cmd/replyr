// Central app state. All state lives here in React (no localStorage /
// sessionStorage anywhere in the app, per the brief).

import { SAMPLE_BUSINESS } from "./presets.js";

let idCounter = 1;
export const nextId = (prefix = "id") => `${prefix}_${idCounter++}`;

// How long a lead can sit in the owner queue before we nudge (demo timer).
export const NUDGE_THRESHOLD_MS = 45 * 1000;

export const initialState = {
  view: "setup", // setup | inbox | dashboard
  onboarded: false,
  business: { ...SAMPLE_BUSINESS },
  apiKey: "",

  // One conversation == one captured enquiry / lead. Single source of truth.
  conversations: [],
  selectedId: null,

  toasts: [],
  nudgedIds: [], // owner-queue ids we've already nudged about

  now: Date.now(),
};

export function reducer(state, action) {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.view };

    case "SET_BUSINESS":
      return { ...state, business: { ...state.business, ...action.patch } };

    case "RESET_BUSINESS":
      return { ...state, business: { ...action.business } };

    case "COMPLETE_ONBOARDING":
      return { ...state, onboarded: true, view: "inbox" };

    case "SET_API_KEY":
      return { ...state, apiKey: action.apiKey };

    case "ADD_ENQUIRY": {
      const convo = {
        id: action.id,
        channel: action.channel,
        customerName: action.customerName || "New enquiry",
        status: "replying", // replying | replied | error
        messages: [{ role: "customer", text: action.text, ts: action.ts }],
        lead: null,
        responseSeconds: null,
        wouldMiss: false,
        ownerHandled: false,
        error: null,
        createdAt: action.ts,
      };
      return {
        ...state,
        conversations: [convo, ...state.conversations],
        selectedId: action.id,
        view: state.onboarded ? "inbox" : state.view,
      };
    }

    case "ADD_CUSTOMER_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id
            ? {
                ...c,
                status: "replying",
                messages: [...c.messages, { role: "customer", text: action.text, ts: action.ts }],
              }
            : c
        ),
      };

    case "ENQUIRY_REPLIED": {
      const { id, reply, lead, responseSeconds, ts } = action;
      // Demo estimate of whether a busy owner would realistically have missed
      // this enquiry without an instant responder. Anything needing the owner
      // or marked high urgency is counted; otherwise a coin-flip stands in for
      // "they were serving a customer / it was after hours".
      const wouldMiss = lead.needs_owner || lead.urgency === "high" || action.missRoll < 0.5;
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "replied",
                customerName: lead.customer_name || c.customerName,
                messages: [...c.messages, { role: "ai", text: reply, ts }],
                lead,
                responseSeconds: responseSeconds ?? c.responseSeconds,
                wouldMiss: c.lead ? c.wouldMiss : wouldMiss, // only set on first reply
              }
            : c
        ),
      };
    }

    case "ENQUIRY_ERROR":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, status: "error", error: action.error } : c
        ),
      };

    case "SELECT_CONVERSATION":
      return { ...state, selectedId: action.id };

    case "MARK_OWNER_HANDLED":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, ownerHandled: true } : c
        ),
      };

    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };

    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    case "MARK_NUDGED":
      return { ...state, nudgedIds: [...state.nudgedIds, action.id] };

    case "TICK":
      return { ...state, now: action.now };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function selectOwnerQueue(state) {
  return state.conversations
    .filter((c) => c.lead && c.lead.needs_owner && !c.ownerHandled)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function selectLeads(state) {
  return state.conversations.filter((c) => c.lead);
}

export function selectStats(state) {
  const replied = state.conversations.filter((c) => c.status === "replied");
  const times = replied.map((c) => c.responseSeconds).filter((s) => s != null);
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  const waiting = selectOwnerQueue(state).length;
  const wouldMiss = state.conversations.filter((c) => c.wouldMiss).length;
  return {
    caught: state.conversations.length,
    avgResponse: avg,
    waiting,
    wouldMiss,
  };
}
