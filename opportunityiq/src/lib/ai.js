import { useEffect, useState } from "react";
import { CONTRACT_BANDS, INDUSTRIES, REGIONS } from "./data.js";
import { DEFAULT_PROFILE } from "./store.js";
import { formatMoney } from "./match.js";
import { AI_ENDPOINT } from "./config.js";

// One AI interface for the whole app:
//   ai.text(prompt, { onText, signal }) -> full answer (streams through onText)
//   ai.json(prompt)                     -> parsed JSON value
// Provider order: the Claude viewer (claude.ai preview), then your own
// AI_ENDPOINT (a server that holds the API key), else null and the app
// falls back to its rule-based matching.

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
      return "AI is switched off for this view, so we used the quick matcher instead.";
    case "rate_limited":
      return "The AI is busy. Give it a minute and try again.";
    case "refused":
      return "The AI couldn't answer that. Try wording it differently.";
    default:
      return "The AI didn't finish answering. Try again.";
  }
}

// ---------- Profile from a plain-English description ----------

const CITY_REGION = {
  perth: "Western Australia", fremantle: "Western Australia", kwinana: "Western Australia", bunbury: "Western Australia",
  pilbara: "Western Australia", joondalup: "Western Australia", mandurah: "Western Australia", welshpool: "Western Australia",
  sydney: "New South Wales", newcastle: "New South Wales", melbourne: "Victoria", geelong: "Victoria",
  brisbane: "Queensland", "gold coast": "Queensland", townsville: "Queensland", adelaide: "South Australia",
  hobart: "Tasmania", darwin: "Northern Territory", canberra: "ACT",
  auckland: "New Zealand", wellington: "New Zealand", singapore: "Singapore", mumbai: "India", bengaluru: "India",
  bangalore: "India", delhi: "India", chennai: "India", dubai: "United Arab Emirates", "abu dhabi": "United Arab Emirates",
  london: "United Kingdom", manchester: "United Kingdom", houston: "United States", "new york": "United States",
  vancouver: "Canada", toronto: "Canada",
};

const KEYWORDS = {
  "Laser cutting": ["laser"], "CNC folding": ["fold", "press brake", "bending"], Welding: ["weld"],
  Rolling: ["roll"], "Structural fabrication": ["structural steel", "structural fab"], Installation: ["install", "erect"],
  Machining: ["machin", "lathe", "cnc mill"], "Galvanising / coating": ["galvan", "coat", "paint"],
  "Structural design": ["structural engineer", "structural design", "bridge"], "Mechanical design": ["mechanical"],
  "Electrical design": ["electrical"], "Drafting / BIM": ["draft", "bim", "cad"], "Project management": ["project manag"],
  "Inspection & certification": ["inspect", "certif"], "Hi-vis garments": ["hi-vis", "hi vis", "high vis"],
  Embroidery: ["embroider"], "Window cleaning": ["window"], "Washroom services": ["washroom"],
  "Commercial cleaning": ["clean"], "Static guarding": ["guard"], "Cybersecurity": ["cyber"], "IT support": ["it support", "helpdesk"],
  "Cloud services": ["cloud"], "Solar PV": ["solar"], "Fresh produce": ["produce", "fruit", "vegetable"], "Screen printing": ["screen print"], Workwear: ["workwear", "uniform"],
};

function localProfile(desc) {
  const t = desc.toLowerCase();
  const hits = (cap) => (KEYWORDS[cap] || [cap.toLowerCase()]).some((k) => t.includes(k));
  let best = "steel";
  let bestN = -1;
  for (const [id, ind] of Object.entries(INDUSTRIES)) {
    const n = ind.capabilities.filter(hits).length + 2 * ind.keywords.filter((k) => t.includes(k)).length;
    if (n > bestN) [best, bestN] = [id, n];
  }
  const ind = INDUSTRIES[best];
  const city = Object.keys(CITY_REGION).find((c) => t.includes(c));
  const region = REGIONS.find((r) => t.includes(r.toLowerCase())) || (city && CITY_REGION[city]) || DEFAULT_PROFILE.region;
  // Match a certification by its full name, or by its standard number ("9001").
  const certs = ind.certifications.filter((c) => {
    const num = c.match(/\d{3,5}/)?.[0];
    return t.includes(c.toLowerCase()) || (num && t.includes(num));
  });
  return {
    ...DEFAULT_PROFILE,
    industry: best,
    region,
    capabilities: ind.capabilities.filter(hits).length ? ind.capabilities.filter(hits) : ind.capabilities.slice(0, 2),
    certifications: certs,
  };
}

function cleanProfile(raw, desc) {
  const fallback = localProfile(desc);
  if (!raw || typeof raw !== "object") return fallback;
  const industry = INDUSTRIES[raw.industry] ? raw.industry : fallback.industry;
  const ind = INDUSTRIES[industry];
  const pick = (list, allowed) => (Array.isArray(list) ? list.filter((x) => allowed.includes(x)) : []);
  const caps = pick(raw.capabilities, ind.capabilities);
  const km = Number(raw.maxDistanceKm);
  return {
    ...DEFAULT_PROFILE,
    companyName: typeof raw.companyName === "string" ? raw.companyName.slice(0, 60) : "",
    industry,
    region: REGIONS.includes(raw.region) ? raw.region : fallback.region,
    maxDistanceKm: km >= 25 && km <= 1500 ? Math.round(km / 25) * 25 : DEFAULT_PROFILE.maxDistanceKm,
    capabilities: caps.length ? caps : fallback.capabilities,
    certifications: pick(raw.certifications, ind.certifications),
    contractBand: CONTRACT_BANDS.some((b) => b.id === raw.contractBand) ? raw.contractBand : DEFAULT_PROFILE.contractBand,
    aiSummary: typeof raw.summary === "string" ? raw.summary.slice(0, 200) : "",
  };
}

function profilePrompt(desc) {
  const lists = Object.entries(INDUSTRIES)
    .map(([id, i]) => `- ${id}: capabilities ${JSON.stringify(i.capabilities)}; certifications ${JSON.stringify(i.certifications)}`)
    .join("\n");
  return `You set up capability profiles for OpportunityIQ, a service that matches businesses to tenders and supply contracts.
Read the business description and reply with only one JSON object of this shape:
{"companyName": string, "industry": string, "region": string, "maxDistanceKm": number, "capabilities": string[], "certifications": string[], "contractBand": string, "summary": string}

Rules:
- industry: one of ${JSON.stringify(Object.keys(INDUSTRIES))}, the closest fit.
- capabilities and certifications: choose ONLY exact strings from that industry's lists below. Include a certification only if the description mentions it.
- region: one of ${JSON.stringify(REGIONS)}. Infer from a city if given (e.g. Perth = Western Australia). Default "Western Australia".
- maxDistanceKm: 25 to 1500. Default 300.
- contractBand: one of ${JSON.stringify(CONTRACT_BANDS.map((b) => `${b.id} (${b.label})`))}, use just the id. Default "s".
- companyName: "" if not given.
- summary: one plain sentence describing what the business does.

Industries:
${lists}

Description:
"""${desc.slice(0, 2000)}"""`;
}

/** Returns { profile, usedAI, note }. Never throws. */
export async function profileFromText(desc) {
  const ai = await getAI();
  if (!ai) return { profile: localProfile(desc), usedAI: false, note: "" };
  try {
    return { profile: cleanProfile(await ai.json(profilePrompt(desc)), desc), usedAI: true, note: "" };
  } catch (e) {
    return { profile: localProfile(desc), usedAI: false, note: aiErrorText(e) };
  }
}

// ---------- Prompts for the rest of the app ----------

const describeProfile = (p) =>
  `${p.companyName || "The business"}: ${INDUSTRIES[p.industry].label}, based in ${p.region}, travels up to ${p.maxDistanceKm} km. ` +
  `Capabilities: ${p.capabilities.join(", ") || "none listed"}. Certifications: ${p.certifications.join(", ") || "none listed"}. ` +
  `Preferred contract size: ${CONTRACT_BANDS.find((b) => b.id === p.contractBand)?.label}.` +
  (p.excluded ? ` Does not want: ${p.excluded}.` : "");

const describeOp = (op, s) =>
  `[${op.id}] ${op.title} | ${op.kind === "tender" ? "Formal tender" : "Early signal (not a contract yet)"} | ${op.buyer} | ${op.location}, ${op.distanceKm} km | est. ${formatMoney(op.value)} | ` +
  `${op.deadline ? `deadline ${op.deadline}` : "no deadline yet"} | needs: ${op.needs.join(", ")} | certifications: ${op.certifications.join(", ") || "none"} | ` +
  `${op.summary}` + (s ? ` | rule-based fit ${s.score}%; gaps: ${s.gaps.join("; ") || "none"}` : "");

export function matchBriefPrompt(profile, top) {
  return `You are OpportunityIQ, an AI business development assistant. A business owner just described their business and you found these matches (fictional sample data).

Business: ${describeProfile(profile)}

Matches:
${top.map((t) => describeOp(t.op, t)).join("\n")}

Write a short briefing for the owner, max 90 words. Start with one sentence on what you understood about their business. Then one bullet per match: "- **<title>**: why it fits, and the one thing to check." Plain, confident Australian English. No preamble, no sign-off.`;
}

export function askPrompt(question, profile, scored) {
  return `You are OpportunityIQ's research assistant. Answer the owner's question using ONLY the opportunities listed (they are fictional sample data). Never invent opportunities, figures or contacts.

Business: ${describeProfile(profile)}

Opportunities:
${scored.map((s) => describeOp(s.op, s)).join("\n")}

Question: """${question.slice(0, 500)}"""

Reply in max 110 words. Use "- **<title>**: reason" bullets for relevant opportunities, best first. If none fit, say so plainly and suggest what to change. Then on the very last line write exactly "IDS: " followed by the comma-separated ids of the opportunities you mentioned, or "IDS: none".`;
}

export function analysisPrompt(op, profile, s) {
  return `You are OpportunityIQ's bid analyst. Analyse this opportunity for this business. The data is fictional sample data.

Business: ${describeProfile(profile)}

Opportunity: ${describeOp(op, s)}
Extracted tender details: ${Object.entries(op.extraction).map(([k, v]) => `${k}: ${v}`).join("; ")}

Use only these facts. Where something isn't stated, say "Not specified". ${op.kind === "signal" ? "This is an early signal, not a contract: make that clear and advise how to get in early." : ""}
Format, max 170 words:
## Verdict
"Bid", "Consider" or "Skip", then one sentence why.
## Why it fits
2 bullets.
## Risks and gaps
2-3 bullets.
## Ask the buyer
3 short questions as bullets.
## Next step
One sentence.`;
}

export function emailPrompt(op, profile, matched) {
  return `Write a short, professional enquiry email (max 140 words) from this business to the buyer's procurement team about the opportunity below. Australian English. Start with a "Subject:" line. Mention the relevant capabilities (${matched.join(", ") || "general"}) and certifications held. Ask 2-3 specific clarifying questions based on the gaps. Use the placeholder [Your name] for the sender. Don't invent facts, prices or contacts.

Business: ${describeProfile(profile)}
Opportunity: ${describeOp(op)}
Known gaps: ${Object.entries(op.extraction).filter(([, v]) => /not specified|risk/i.test(v)).map(([k, v]) => `${k}: ${v}`).join("; ") || "none"}`;
}

/** Splits the trailing "IDS:" line off an answer (also while it streams). */
export function splitIds(text) {
  const i = text.lastIndexOf("IDS:");
  if (i === -1) return { body: text, ids: null };
  const ids = text
    .slice(i + 4)
    .split(/[,\s]+/)
    .map((x) => x.replace(/[^\w-]/g, ""))
    .filter((x) => /^op-\d+$/.test(x));
  return { body: text.slice(0, i).trimEnd(), ids };
}
