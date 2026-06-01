// AI layer for Replyr.
//
// Two responders share one contract: given the business knowledge base + tone
// + the customer message, return { reply, lead }.
//
//   - callClaude(): real Anthropic API (used when an API key is provided).
//   - mockResponder(): a rule-based stand-in so the full loop is demonstrable
//     with zero setup. Clearly surfaced in the UI as "Demo AI".
//
// Both run the SAME system rules from §4 of the brief: answer only from the
// knowledge base, never quote prices or commit to custom work, hand off
// anything involving money / custom jobs / complaints / out-of-scope to the
// owner and flag needs_owner.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

export function buildKnowledgeBlock(business) {
  const lines = [
    `Business name: ${business.name || "(unnamed)"}`,
    `Business type: ${business.type}`,
    `Description: ${business.description || "(none provided)"}`,
    `Opening hours: ${business.hours || "(not provided)"}`,
    `Location: ${business.location || "(not provided)"}`,
    `Services / products: ${business.services || "(not provided)"}`,
    `Prices: ${business.prices || "(not provided — never invent prices)"}`,
    `FAQ / things to know: ${business.faq || "(none)"}`,
    `Tone of voice: ${business.tone}`,
  ];
  return lines.join("\n");
}

// Quote-based businesses must NEVER be priced by the AI; transactional ones may
// confirm simple fixed-detail things like hours or a basic booking request.
const QUOTE_BASED = new Set(["Trades & Fabrication", "Real estate"]);

export function isQuoteBased(type) {
  return QUOTE_BASED.has(type);
}

export function buildPrompt(business, customerMessage, history = []) {
  const knowledge = buildKnowledgeBlock(business);
  const quoteBased = isQuoteBased(business.type);

  const scopeRule = quoteBased
    ? `This is a QUOTE-BASED business. You must NEVER quote a price or commit to custom work. For any request for a quote, price, custom job, or availability, capture the request warmly and tell the customer the owner will follow up shortly with details — then set needs_owner to true.`
    : `This is a TRANSACTIONAL business. You may confirm simple, fixed-detail things (opening hours, location, taking a basic booking request). You must still hand off anything involving custom pricing, complaints, negotiation, or anything not in the knowledge base.`;

  const conversationSoFar =
    history.length > 0
      ? `\n\nConversation so far:\n${history
          .map((m) => `${m.role === "customer" ? "Customer" : "You"}: ${m.text}`)
          .join("\n")}`
      : "";

  return `You are the AI "first responder" for a small business. You reply instantly to customer enquiries in the business's voice, qualify the lead, and route anything that needs a human to the owner.

=== BUSINESS KNOWLEDGE BASE ===
${knowledge}

=== HARD RULES ===
- Reply ONLY from the knowledge base above. Answer hours, location, and services confidently.
- Be warm and on-brand for the "${business.tone}" tone. Keep replies concise (1-3 short sentences).
- ${scopeRule}
- NEVER invent facts, prices, availability, delivery times, or outcomes. If you don't know, say the owner will confirm shortly and set needs_owner to true.
- Hand off to the owner (needs_owner: true) for: price quotes, custom jobs, complaints, negotiations, or anything outside the knowledge base. Politely tell the customer the owner will follow up shortly.
- Extract structured lead data from the conversation.

=== CUSTOMER MESSAGE ===${conversationSoFar}
Customer: ${customerMessage}

=== OUTPUT FORMAT ===
Respond with ONLY a single JSON object (no prose, no markdown fences) of exactly this shape:
{
  "reply": "your on-brand reply to the customer",
  "lead": {
    "customer_name": "",
    "contact": "",
    "intent": "quote_request | booking | general_question | order",
    "summary": "one-line summary of what they want",
    "urgency": "high | medium | low",
    "needs_owner": true
  }
}
Leave customer_name/contact as "" if not stated. Choose the single best intent. Output the JSON object only.`;
}

// ---------------------------------------------------------------------------
// Safe JSON parsing (strip code fences, tolerate surrounding prose)
// ---------------------------------------------------------------------------

export function parseAiJson(text) {
  let clean = String(text || "").replace(/```json|```/g, "").trim();
  // If the model wrapped the JSON in any prose, grab the outermost object.
  const first = clean.indexOf("{");
  const last = clean.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    clean = clean.slice(first, last + 1);
  }
  const parsed = JSON.parse(clean);
  return normaliseResult(parsed);
}

function normaliseResult(parsed) {
  const lead = parsed.lead || {};
  const validIntents = ["quote_request", "booking", "general_question", "order"];
  const validUrgency = ["high", "medium", "low"];
  return {
    reply: String(parsed.reply || "").trim() || "Thanks for reaching out — the owner will be in touch shortly.",
    lead: {
      customer_name: String(lead.customer_name || "").trim(),
      contact: String(lead.contact || "").trim(),
      intent: validIntents.includes(lead.intent) ? lead.intent : "general_question",
      summary: String(lead.summary || "").trim() || "Customer enquiry",
      urgency: validUrgency.includes(lead.urgency) ? lead.urgency : "medium",
      needs_owner: Boolean(lead.needs_owner),
    },
  };
}

// ---------------------------------------------------------------------------
// Real Anthropic call (direct from browser)
// ---------------------------------------------------------------------------

export async function callClaude({ apiKey, business, customerMessage, history }) {
  const prompt = buildPrompt(business, customerMessage, history);
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // Required to call the API directly from a browser context.
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const err = await res.json();
      detail = err?.error?.message || JSON.stringify(err);
    } catch {
      detail = `${res.status} ${res.statusText}`;
    }
    throw new Error(`Anthropic API error: ${detail}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return parseAiJson(text);
}

// ---------------------------------------------------------------------------
// Rule-based mock responder (no API key needed)
// ---------------------------------------------------------------------------

const QUOTE_WORDS = ["quote", "price", "cost", "how much", "pricing", "estimate", "$", "rates", "charge"];
const CUSTOM_WORDS = ["build", "custom", "fabricate", "weld", "install", "make me", "design", "renovat"];
const BOOKING_WORDS = ["book", "booking", "reserve", "reservation", "table", "appointment", "slot", "seat"];
const ORDER_WORDS = ["order", "buy", "purchase", "takeaway", "take away", "delivery", "pickup", "pick up"];
const COMPLAINT_WORDS = ["complaint", "refund", "terrible", "awful", "disappointed", "rude", "wrong", "broken"];
const URGENT_WORDS = ["urgent", "asap", "today", "now", "right away", "emergency", "tonight", "immediately"];
const HOURS_WORDS = ["open", "hours", "close", "closing", "opening", "what time", "when are you"];
const LOCATION_WORDS = ["where", "located", "location", "address", "find you", "parking", "directions"];

function includesAny(text, words) {
  return words.some((w) => text.includes(w));
}

function applyTone(text, tone) {
  if (tone === "Casual") return text.replace(/\.$/, " 🙂");
  return text;
}

function extractName(text) {
  const m =
    text.match(/\b(?:i am|i'm|im|this is|name is|name's)\s+([A-Z][a-z]+)/i) ||
    text.match(/\b(?:it's|its)\s+([A-Z][a-z]+)\s+here/i);
  return m ? m[1].replace(/^\w/, (c) => c.toUpperCase()) : "";
}

function extractContact(text) {
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (email) return email[0];
  const phone = text.match(/(\+?\d[\d\s-]{7,}\d)/);
  if (phone) return phone[0].trim();
  return "";
}

export function mockResponder({ business, customerMessage }) {
  const text = String(customerMessage || "").toLowerCase();
  const tone = business.tone;
  const quoteBased = isQuoteBased(business.type);
  const greeting =
    tone === "Professional" ? "Thank you for reaching out." : tone === "Casual" ? "Hey, thanks for the message!" : "Hi there, thanks for getting in touch!";

  const name = extractName(customerMessage);
  const contact = extractContact(customerMessage);
  const urgency = includesAny(text, URGENT_WORDS) ? "high" : "medium";

  let intent = "general_question";
  let needs_owner = false;
  let summary = "General enquiry";
  let reply = "";

  const wantsQuote = includesAny(text, QUOTE_WORDS) || (quoteBased && includesAny(text, CUSTOM_WORDS));
  const isComplaint = includesAny(text, COMPLAINT_WORDS);

  if (isComplaint) {
    intent = "general_question";
    needs_owner = true;
    summary = "Complaint / issue needs owner's attention";
    reply = `${greeting} I'm really sorry to hear that — I want to make sure this is handled properly, so I'm passing it straight to the owner who'll follow up with you very shortly.`;
  } else if (wantsQuote || (quoteBased && includesAny(text, CUSTOM_WORDS))) {
    intent = "quote_request";
    needs_owner = true;
    summary = "Wants a price / custom job — needs owner to quote";
    reply = `${greeting} That sounds like a great project. I can't quote on this myself, but I've captured all the details and the owner will get back to you shortly with pricing.`;
  } else if (includesAny(text, BOOKING_WORDS) && !quoteBased) {
    intent = "booking";
    needs_owner = true;
    summary = "Booking request";
    reply = `${greeting} I'd love to help with that booking — I've noted your request and the owner will confirm the details with you very soon.`;
  } else if (includesAny(text, ORDER_WORDS)) {
    intent = "order";
    needs_owner = true;
    summary = "Order / purchase enquiry";
    reply = `${greeting} Thanks for your order enquiry — I've passed the details to the owner who'll confirm everything shortly.`;
  } else if (includesAny(text, HOURS_WORDS) && business.hours) {
    intent = "general_question";
    summary = "Asked about opening hours";
    reply = `${greeting} Our hours are: ${business.hours}.`;
  } else if (includesAny(text, LOCATION_WORDS) && business.location) {
    intent = "general_question";
    summary = "Asked for location / directions";
    reply = `${greeting} You can find us at ${business.location}.`;
  } else {
    // Out-of-knowledge-base fallback: never invent, hand off.
    intent = "general_question";
    needs_owner = true;
    summary = "General question — needs owner to confirm";
    reply = `${greeting} Great question — I want to make sure you get the right answer, so the owner will confirm the details with you shortly.`;
  }

  return {
    reply: applyTone(reply, tone),
    lead: {
      customer_name: name,
      contact,
      intent,
      summary,
      urgency,
      needs_owner,
    },
  };
}

// ---------------------------------------------------------------------------
// Unified entry point used by the app.
// ---------------------------------------------------------------------------

export async function generateResponse({ apiKey, business, customerMessage, history }) {
  if (apiKey && apiKey.trim()) {
    return callClaude({ apiKey: apiKey.trim(), business, customerMessage, history });
  }
  // Tiny simulated latency so the "replied in N seconds" stamp feels real.
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 900));
  return mockResponder({ business, customerMessage });
}

export { MODEL };
