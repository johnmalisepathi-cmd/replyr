import { useEffect, useState } from "react";
import { GOAL_TYPES } from "./goals.js";
import { REGIONS } from "./places.js";
import { priceOf } from "./match.js";
import { AI_ENDPOINT } from "./config.js";

// One AI interface for the whole app:
//   ai.text(prompt, { onText, signal }) -> full answer (streams through onText)
//   ai.json(prompt)                     -> parsed JSON value
// Provider order: the Claude viewer (claude.ai preview), then your own
// AI_ENDPOINT (a server that holds the API key), else null and the app
// falls back to its rule-based assistant.

let aiPromise;

export function getAI() {
  if (!aiPromise) aiPromise = loadAI();
  return aiPromise;
}

async function loadAI() {
  if (typeof window !== "undefined" && window.claude?.use) {
    try {
      const sample = await window.claude.use("sample");
      if (sample) return fromSample(sample);
    } catch {
      // fall through to the endpoint
    }
  }
  if (AI_ENDPOINT) return fromEndpoint(AI_ENDPOINT);
  return null;
}

function fromSample(sample) {
  return {
    text: (prompt, { onText, signal } = {}) =>
      sample(prompt, { modelTier: "quick", onText, signal }).then((r) => r.text),
    json: (prompt) => sample.json(prompt, { modelTier: "quick" }),
  };
}

// Expected server contract: POST {prompt, format: "text"|"json"} -> {text}.
function fromEndpoint(url) {
  const call = async (prompt, format, signal) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, format }),
      signal,
    });
    if (!res.ok) throw { code: res.status === 429 ? "rate_limited" : "upstream_error" };
    return (await res.json()).text;
  };
  return {
    text: async (prompt, { onText, signal } = {}) => {
      const text = await call(prompt, "text", signal);
      onText?.({ text, delta: text });
      return text;
    },
    json: async (prompt) => {
      const text = await call(prompt, "json");
      const m = text.match(/[[{][\s\S]*[\]}]/);
      return JSON.parse(m ? m[0] : text);
    },
  };
}

/** undefined while checking, null when AI is off, otherwise the AI object. */
export function useAI() {
  const [ai, setAI] = useState(undefined);
  useEffect(() => {
    let live = true;
    getAI().then((a) => live && setAI(a));
    return () => {
      live = false;
    };
  }, []);
  return ai;
}

export function aiErrorText(e) {
  switch (e?.code) {
    case "cancelled":
      return "";
    case "not_granted":
    case "sampling_disabled":
    case "capability_disabled":
      return "AI is switched off for this view, so the quick assistant answered instead.";
    case "rate_limited":
      return "The AI is busy. Give it a minute and try again.";
    case "refused":
      return "The AI couldn't answer that. Try wording it differently.";
    default:
      return "The AI didn't finish answering. Try again.";
  }
}

// ---------- Goals from plain speech ----------

const day = 86_400_000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

const PLACES = ["bali", "phuket", "perth", "perth cbd", "sydney", "melbourne", "brisbane", "tokyo", "fiji", "london", "singapore", "dubai", "northbridge", "subiaco", "leederville"];
const PREFS = ["villa", "pool", "beach", "camera", "battery", "3-bed", "4-bed", "train", "thai", "spicy", "sushi", "pizza", "hybrid", "suv", "remote", "ux", "cheap", "quiet", "kids"];

function whenFrom(t) {
  const m = t.match(/(\d+)\s*(day|week|month|year)s?/);
  if (/tonight|today|right now/.test(t)) return iso(Date.now());
  if (/tomorrow/.test(t)) return iso(Date.now() + day);
  if (/this (week|weekend)|friday|saturday|sunday/.test(t)) return iso(Date.now() + 4 * day);
  if (/next month|a month|one month/.test(t)) return iso(Date.now() + 30 * day);
  if (/next year|a year|one year|12 months/.test(t)) return iso(Date.now() + 365 * day);
  const mon = t.match(/next (january|february|march|april|may|june|july|august|september|october|november|december)/);
  if (mon) {
    const target = new Date(`${mon[1]} 1, ${new Date().getFullYear()}`);
    if (target <= new Date()) target.setFullYear(target.getFullYear() + 1);
    return iso(target.getTime());
  }
  if (m) return iso(Date.now() + Number(m[1]) * { day: 1, week: 7, month: 30.4, year: 365 }[m[2]] * day);
  return iso(Date.now() + 60 * day);
}

function budgetFrom(t) {
  const m = t.match(/\$\s?(\d[\d,.]*)\s*(k|m)?|(\d[\d,.]*)\s*(k|m)\b|under\s+(\d[\d,]*)/);
  if (!m) return null;
  const n = Number((m[1] || m[3] || m[5]).replace(/,/g, ""));
  const mult = (m[2] || m[4]) === "k" ? 1000 : (m[2] || m[4]) === "m" ? 1_000_000 : 1;
  return Math.round(n * mult);
}

const typeOf = (t) =>
  Object.entries(GOAL_TYPES).find(([, g]) => g.keywords.some((k) => new RegExp(`\\b${k}`).test(t)))?.[0];

/** Splits a narration into goals without AI (the fallback). */
function localGoals(text, city = "Perth") {
  // Break into small chunks; a chunk that names a new kind of goal starts it,
  // other chunks (budgets, dates, wishes) add detail to the goal before them.
  const chunks = text.split(/[;\n!?]|\.(?!\d)|,(?!\d{3})|\band\b|\balso\b/i).map((x) => x.trim()).filter(Boolean);
  const groups = [];
  for (const chunk of chunks) {
    const type = typeOf(chunk.toLowerCase());
    if (type && !groups.some((g) => g.type === type)) groups.push({ type, parts: [chunk] });
    else if (groups.length) groups[groups.length - 1].parts.push(chunk);
  }
  return groups.map(({ type, parts }, i) => {
    const wish = parts.join(", ");
    const t = wish.toLowerCase();
    const place = [...PLACES].sort((x, y) => y.length - x.length).find((p) => t.includes(p));
    const first = parts[0].replace(/^(i'?m|we'?re|i am|we are)?\s*(also\s+)?(planning|want|need|looking|hoping|keen)\s+(to\s+|for\s+)?(buy\s+|get\s+|find\s+)?/i, "").replace(/^(a|an|the|me)\s+/i, "");
    return {
      id: `g-${type}-${i}`,
      type,
      title: first.length > 3 && first.length <= 40 ? first.replace(/^./, (c) => c.toUpperCase()) : GOAL_TYPES[type].label,
      wish,
      budget: budgetFrom(t),
      when: whenFrom(t),
      location: place ? place.replace(/\b\w/g, (c) => c.toUpperCase()).replace("Cbd", "CBD") : type === "dining" ? `${city} CBD` : city,
      prefs: PREFS.filter((p) => t.includes(p)),
    };
  });
}

const nameFrom = (text) => text.match(/\b(?:i'?m|i am|my name is|this is)\s+([A-Z][a-z]{1,20})\b/)?.[1] || "";

function goalsPrompt(text, city) {
  return `You are OpportunityIQ, a personal AI assistant. A person described what they want in plain words. Split it into separate goals.
Reply with only one JSON object: {"name": string, "city": string, "goals": [{"type": string, "title": string, "wish": string, "budget": number|null, "inDays": number, "location": string, "prefs": string[]}]}

Rules:
- type: one of ${JSON.stringify(Object.keys(GOAL_TYPES))} (${Object.entries(GOAL_TYPES).map(([k, g]) => `${k} = ${g.label}`).join("; ")}). Skip anything that fits none.
- title: 2-5 words, e.g. "Bali holiday for 2".
- wish: their words for this goal, tidied, one sentence.
- budget: total in AUD as a number (per person for dining), or null if not given. "$4k" = 4000.
- inDays: days from today until they need it (tonight = 0, "in 6 months" = 182). Default 60.
- location: the destination or area, else "${city}".
- prefs: 1-4 short lowercase keywords for what matters (e.g. "pool", "camera", "spicy", "3-bed", "train").
- name: their first name if given, else "". city: their home city if given, else "${city}".
At most 6 goals.

Their words:
"""${text.slice(0, 2000)}"""`;
}

/** Returns { goals, name, city, usedAI, note }. Never throws. */
export async function goalsFromText(text, city = "Perth") {
  const fallback = () => ({ goals: localGoals(text, city), name: nameFrom(text), city, usedAI: false });
  const ai = await getAI();
  if (!ai) return { ...fallback(), note: "" };
  try {
    const raw = await ai.json(goalsPrompt(text, city));
    const list = Array.isArray(raw?.goals) ? raw.goals : [];
    const goals = list
      .filter((g) => GOAL_TYPES[g?.type])
      .slice(0, 6)
      .map((g, i) => ({
        id: `g-${g.type}-${i}`,
        type: g.type,
        title: String(g.title || GOAL_TYPES[g.type].label).slice(0, 48),
        wish: String(g.wish || "").slice(0, 200),
        budget: Number(g.budget) > 0 ? Number(g.budget) : null,
        when: iso(Date.now() + Math.max(0, Math.min(3650, Number(g.inDays) || 60)) * day),
        location: String(g.location || city).slice(0, 40),
        prefs: Array.isArray(g.prefs) ? g.prefs.map((p) => String(p).toLowerCase().slice(0, 20)).slice(0, 4) : [],
      }));
    if (!goals.length) return { ...fallback(), note: "" };
    return { goals, name: String(raw.name || "").slice(0, 30), city: String(raw.city || city).slice(0, 30), usedAI: true, note: "" };
  } catch (e) {
    return { ...fallback(), note: aiErrorText(e) };
  }
}

// ---------- Prompts for the rest of the app ----------

const describeGoal = (g) =>
  `${g.title} (${GOAL_TYPES[g.type].label}): "${g.wish}". Budget: ${g.budget ? `$${g.budget.toLocaleString("en-AU")}` : "not set"}. Needed by ${g.when}. Place: ${g.location}. Wants: ${g.prefs.join(", ") || "nothing specific"}.`;

const describeFind = (s) =>
  `[${s.op.id}] ${s.op.title} | ${s.op.kind === "watch" ? "Watching (alert, not a product)" : "Available now"} | ${s.op.location} | ${priceOf(s.op) || "no price"} | ${s.op.rating ? `rated ${s.op.rating}` : "no rating"} | ${s.op.tag} | ${Object.entries(s.op.facts).map(([k, v]) => `${k}: ${v}`).join("; ")} | fit ${s.score}% for goal "${s.goal.title}"`;

export function briefingPrompt(profile, top) {
  return `You are OpportunityIQ, a warm, sharp personal assistant that watches the world 24/7 for someone's goals. Everything below is fictional sample data.

Their goals:
${profile.goals.map(describeGoal).join("\n")}

Best finds right now:
${top.map(describeFind).join("\n")}

Write today's briefing, max 100 words. Start with "${profile.name ? `Good morning, ${profile.name}.` : "Good morning."}" then one bullet per goal: "- **<goal title>**: the single most useful update and what to do next." Friendly, specific, Australian English. No preamble, no sign-off.`;
}

export function askPrompt(question, profile, scored) {
  return `You are OpportunityIQ, a personal AI assistant. Answer using ONLY the finds listed (fictional sample data). Never invent places, prices or ratings.

Their goals:
${profile.goals.map(describeGoal).join("\n")}

Finds:
${scored.map(describeFind).join("\n")}

Question: """${question.slice(0, 500)}"""

Reply in max 110 words with "- **<name>**: why" bullets, best first. If nothing fits, say so and suggest what to change. Then on the very last line write exactly "IDS: " followed by the comma-separated ids you mentioned, or "IDS: none".`;
}

const ADVICE = {
  holiday: "Cover: when to book and why, how to split the budget (flights, stay, spending), the best pick and one alternative, and 2 practical tips.",
  tech: "Cover: which one to buy and why, whether to buy now or wait for the sale, and what to check before buying.",
  home: "Cover: what the sample interest rate means for their repayments, how much buffer to keep, which listing fits best and why, first-home grants to check, and next steps (pre-approval, inspections). Add one line: this is general information, not financial advice.",
  dining: "Cover: your top pick for tonight and why, a backup, and when to go or book.",
  car: "Cover: which car is the best value and why, what to check (service history, inspection), and whether to wait for sales.",
  events: "Cover: how to get the tickets (presale timing, resale safety) and what to set reminders for.",
  career: "Cover: which option fits best, what to highlight in the application, and deadlines.",
  money: "Cover: which change saves the most, how much, and the steps to switch.",
};

export function advicePrompt(goal, scored) {
  return `You are OpportunityIQ, a personal AI assistant. Give advice for this goal using ONLY these facts (fictional sample data). Where something isn't stated, say "not stated".

Goal: ${describeGoal(goal)}

Finds:
${scored.map(describeFind).join("\n")}

${ADVICE[goal.type]}
Format, max 170 words:
## Our pick
One sentence.
## Why
2 bullets.
## Watch out
1-2 bullets.
## Next steps
2-3 bullets.`;
}

/** Splits the trailing "IDS:" line off an answer (also while it streams). */
export function splitIds(text) {
  const i = text.lastIndexOf("IDS:");
  if (i === -1) return { body: text, ids: null };
  const ids = text
    .slice(i + 4)
    .split(/[,\s]+/)
    .map((x) => x.replace(/[^\w-]/g, ""))
    .filter((x) => /^f-[a-z0-9]+$/.test(x));
  return { body: text.slice(0, i).trimEnd(), ids };
}
