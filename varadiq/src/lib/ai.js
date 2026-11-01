import { useEffect, useState } from "react";
import { GOAL_TYPES } from "./goals.js";
import { REGIONS } from "./places.js";
import { priceOf } from "./match.js";
import { AI_ENDPOINT } from "./config.js";
import { currentLocale, myMoney } from "./locale.js";

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
    const data = await res.json();
    if (data.refused) throw { code: "refused" };
    return data.text;
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
    case "timeout":
      return "The web search took too long this time. Try again, or make the goal a little more specific.";
    default:
      return "The AI didn't finish answering. Try again.";
  }
}

// ---------- Goals from plain speech ----------

const day = 86_400_000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

const PLACES = ["india", "goa", "kerala", "delhi", "mumbai", "japan", "tokyo", "kyoto", "dubai", "abu dhabi", "thailand", "bangkok", "vietnam", "hanoi", "singapore", "malaysia", "kuala lumpur", "sri lanka", "nepal", "maldives", "new zealand", "queenstown", "auckland", "fiji", "hawaii", "usa", "new york", "los angeles", "canada", "london", "uk", "paris", "france", "italy", "rome", "spain", "greece", "europe", "turkey", "egypt", "south africa", "korea", "seoul", "china", "hong kong", "philippines", "cambodia", "laos", "adelaide", "hobart", "tasmania", "darwin", "cairns", "gold coast", "margaret river", "broome", "bali", "phuket", "perth", "perth cbd", "sydney", "melbourne", "brisbane", "tokyo", "fiji", "london", "singapore", "dubai", "northbridge", "subiaco", "leederville"];
const PREFS = ["electricity", "insurance", "subscriptions", "internet", "villa", "pool", "beach", "camera", "battery", "3-bed", "4-bed", "train", "thai", "spicy", "sushi", "pizza", "hybrid", "suv", "remote", "ux", "cheap", "quiet", "kids"];

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
    const place = [...PLACES].sort((x, y) => y.length - x.length).find((p) => new RegExp(`\\b${p}\\b`).test(t));
    const first = parts[0].replace(/^(i'?m|we'?re|i am|we are)?\s*(also\s+)?(planning|want|need|looking|hoping|keen)\s+(to\s+|for\s+)?(buy\s+|get\s+|find\s+)?/i, "").replace(/^(a|an|the|me)\s+/i, "");
    return {
      id: `g-${type}-${i}`,
      type,
      title: first.length > 3 && first.length <= 28 && !first.includes(":") ? first.replace(/^./, (c) => c.toUpperCase()) : GOAL_TYPES[type].label,
      wish,
      budget: budgetFrom(t),
      when: whenFrom(t),
      location: place ? place.replace(/\b\w/g, (c) => c.toUpperCase()).replace("Cbd", "CBD").replace(/^(Usa|Uk)$/, (m) => m.toUpperCase()) : type === "dining" ? `${city} CBD` : type === "holiday" ? "" : city,
      prefs: PREFS.filter((p) => t.includes(p)),
      created: iso(Date.now()),
    };
  });
}

const nameFrom = (text) => text.match(/\b(?:i'?m|i am|my name is|this is)\s+([A-Z][a-z]{1,20})\b/)?.[1] || "";

function goalsPrompt(text, city) {
  return `You are VaradIQ, a personal AI assistant. A person described what they want in plain words. Split it into separate goals.
Reply with only one JSON object: {"name": string, "city": string, "goals": [{"type": string, "title": string, "wish": string, "budget": number|null, "inDays": number, "location": string, "prefs": string[]}]}

Rules:
- type: one of ${JSON.stringify(Object.keys(GOAL_TYPES))} (${Object.entries(GOAL_TYPES).map(([k, g]) => `${k} = ${g.label}`).join("; ")}). Skip anything that fits none.
- title: 2-5 words, e.g. "Bali holiday for 2".
- wish: their words for this goal, tidied, one sentence.
- budget: total in ${currentLocale().currency} as a number (per person for dining), or null if not given. "4k" = 4000.
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
        created: iso(Date.now()),
      }));
    if (!goals.length) return { ...fallback(), note: "" };
    return { goals, name: String(raw.name || "").slice(0, 30), city: String(raw.city || city).slice(0, 30), usedAI: true, note: "" };
  } catch (e) {
    return { ...fallback(), note: aiErrorText(e) };
  }
}

// ---------- Prompts for the rest of the app ----------

const describeGoal = (g) =>
  `${g.title} (${GOAL_TYPES[g.type].label}): "${g.wish}". Budget: ${g.budget ? myMoney(g.budget) : "not set"}. Needed by ${g.when}. Place: ${g.location || "not set"}. Wants: ${g.prefs.join(", ") || "nothing specific"}.`;

// Who the person is and how to write for them (country, currency, spelling).
const aboutPerson = () => {
  const l = currentLocale();
  return `The person lives in ${l.countryName} and uses ${l.currency}. Write in ${l.english}, with amounts in ${l.currency}.`;
};

const describeFind = (s) =>
  `[${s.op.id}] ${s.op.title} | ${s.op.kind === "watch" ? "Watching (alert, not a product)" : "Available now"} | ${s.op.location} | ${priceOf(s.op) || "no price"} | ${s.op.rating ? `rated ${s.op.rating}` : "no rating"} | ${s.op.tag} | ${Object.entries(s.op.facts).map(([k, v]) => `${k}: ${v}`).join("; ")} | fit ${s.score}% for goal "${s.goal.title}"`;

export function briefingPrompt(profile, top, todo = []) {
  return `You are VaradIQ, a warm, sharp AI goal agent that plans people's goals, watches the world 24/7 for them and keeps them moving until each goal is done. Everything below is fictional sample data.

Their goals:
${profile.goals.map(describeGoal).join("\n")}

Best finds right now:
${top.map(describeFind).join("\n")}

${todo.length ? `Today's actions from their plans:\n${todo.slice(0, 4).map((t) => `- ${t.text} (${t.goal.title})`).join("\n")}\n\n` : ""}Write today's briefing, max 110 words. Start with "${profile.name ? `Good morning, ${profile.name}.` : "Good morning."}" then one bullet per goal: "- **<goal title>**: the single most useful update and what to do next." If today's actions are given, end with a line "**Today:**" and the 2 most important actions. Friendly and specific. ${aboutPerson()} No preamble, no sign-off.`;
}

export function askPrompt(question, profile, scored) {
  return `You are VaradIQ, a personal AI assistant. Answer using ONLY the finds listed (fictional sample data). Never invent places, prices or ratings. ${aboutPerson()}

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
  money: "Cover: the total yearly saving if they switch everything, which switch to do first (check renewal dates), and how the saving could fund their other goals.",
};

export function advicePrompt(goal, scored) {
  return `You are VaradIQ, a personal AI assistant. Give advice for this goal using ONLY these facts (fictional sample data). Where something isn't stated, say "not stated". ${aboutPerson()}

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

// ---------- The Goal Agent: plans and check-ins ----------

const describeStep = (s) => `${s.done ? "[done]" : "[todo]"} ${s.title} (due ${s.due}, ${s.who === "agent" ? "agent does it" : "person does it"})`;

/** Asks the AI to tailor a goal's plan. Returns steps or null. */
export async function aiPlan(goal) {
  const ai = await getAI();
  if (!ai) return null;
  const raw = await ai.json(`You are VaradIQ, an AI goal agent that plans goals and works on them 24/7. Write a step-by-step plan for this goal.
Goal: ${describeGoal(goal)} Today is ${iso(Date.now())}.
Reply with only a JSON array of 4-7 steps in order: [{"title": string (max 6 words), "inDays": number (days from today, last step on or before the goal date), "who": "agent"|"you", "detail": string (one short sentence: what happens, e.g. what the agent watches or what the person must do)}].
"agent" steps are research, watching prices and reminders. "you" steps are decisions, bookings, payments and signing. ${aboutPerson()}`);
  if (!Array.isArray(raw) || !raw.length) return null;
  const left = Math.max(0, Math.ceil((new Date(goal.when) - Date.now()) / day));
  return raw.slice(0, 7).map((x, i) => ({
    id: `a${i}`,
    title: String(x.title || `Step ${i + 1}`).slice(0, 60),
    who: x.who === "agent" ? "agent" : "you",
    detail: String(x.detail || "").slice(0, 160),
    due: iso(Date.now() + Math.max(0, Math.min(left, Number(x.inDays) || 0)) * day),
  }));
}

export function checkinPrompt(profile, goal, steps, money, scored) {
  return `You are VaradIQ, a warm but honest AI goal agent. You work on people's goals 24/7 and check in weekly to keep them moving. Everything is fictional sample data. ${aboutPerson()}

Person: ${profile.name || "the user"}. Goal: ${describeGoal(goal)}
Plan:
${steps.map(describeStep).join("\n")}
Money: ${money}
Best finds:
${scored.slice(0, 5).map(describeFind).join("\n")}

Write this week's check-in, max 120 words, in this format:
## This week
One sentence on progress (be specific, use the numbers).
## Do these next
2-3 bullets, each a concrete action with a date or amount.
## I'm handling
1-2 bullets on what you (the agent) will keep watching.
Encouraging, never preachy. No sign-off.`;
}

// ---------- Live web search ----------

// The live search runs on our own server (api/finds.js), next to the AI endpoint.
const FINDS_ENDPOINT = AI_ENDPOINT ? AI_ENDPOINT.replace(/\/ai\/?$/, "/finds") : "";
export const canSearchLive = !!FINDS_ENDPOINT;

/** Real options found on the web for a goal. Resolves {items} or rejects {code}. */
export async function liveFinds(goal, near) {
  if (!FINDS_ENDPOINT) throw { code: "not_granted" };
  const res = await fetch(FINDS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      goal: { type: goal.type, title: goal.title, wish: goal.wish, budget: goal.budget, when: goal.when, location: goal.location, prefs: goal.prefs },
      near,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { code: res.status === 429 ? "rate_limited" : res.status === 504 || err.error === "timeout" ? "timeout" : "upstream_error", detail: err.detail || err.error || `HTTP ${res.status}` };
  }
  const data = await res.json();
  if (data.refused) throw { code: "refused" };
  return { items: Array.isArray(data.items) ? data.items : [], at: new Date().toISOString() };
}

/** Prompt: compare real options found on the web and recommend the best ones. */
export function comparePrompt(goal, items) {
  const list = items.map((it, i) => `${i + 1}. ${it.title} | ${it.location || "online"} | ${it.price || "price not shown"} | ${it.why || ""} | ${it.url}`).join("\n");
  return `You are VaradIQ, a warm, honest AI goal agent. ${aboutPerson()}
Goal: ${describeGoal(goal)}

Real options found on the web just now:
${list}

Compare them for this person and recommend. Use ONLY the facts listed; where something isn't stated, say so. Max 160 words, in this format:
## Best pick
**<option name>**: one sentence on why.
## Also good
- **<option name>**: why, and who it suits.
- **<option name>**: why, and who it suits.
## Check before you buy
1-2 bullets (e.g. warranty, model, delivery, total price with fees).
No preamble, no sign-off.`;
}
