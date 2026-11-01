import Anthropic from "@anthropic-ai/sdk";

// VaradIQ's live web search (a Vercel serverless function at /api/finds).
// The website sends { goal, near } and gets back { items: [...] }: real places,
// products or offers found on the web for that goal, each with a link to the
// provider's own page. The API key stays here on the server.

export const config = { maxDuration: 60 };

const client = new Anthropic();
const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
const MAX_CONTINUATIONS = 3;

const clean = (v, n = 120) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

function describe(goal, near) {
  const parts = [
    `Goal: ${clean(goal.title, 60)} (${clean(goal.type, 20)}).`,
    goal.wish ? `In their words: "${clean(goal.wish, 240)}".` : "",
    goal.budget ? `Budget: about AUD ${Number(goal.budget).toLocaleString("en-AU")}${goal.type === "dining" ? " per person" : ""}.` : "Budget: not set.",
    goal.when ? `Needed by: ${clean(goal.when, 10)}.` : "",
    goal.location ? `Place: ${clean(goal.location, 60)}.` : "",
    goal.prefs?.length ? `What matters: ${goal.prefs.map((p) => clean(p, 20)).join(", ")}.` : "",
    near?.label ? `The person lives near ${clean(near.label, 60)}, Australia.` : "The person lives in Australia.",
  ];
  return parts.filter(Boolean).join(" ");
}

function prompt(goal, near) {
  return `Search the web for the best current options for this person's goal, then reply.

${describe(goal, near)}

Find 3 to 5 real, specific options available now (for example hotels or flights for a trip, restaurants open near them, products in stock at Australian stores, homes or cars for sale, energy plans). Prefer options that fit the budget and what matters to them, and the official provider or booking page for each.

Reply with ONLY a JSON array, no other text:
[{"title": string (max 70 chars), "location": string (suburb, city or store/website name), "price": string or null (as published, e.g. "From $189/night" or "$1,099"), "why": string (one short sentence on why it fits), "url": string (the exact page URL from your search results where they can view or book it)}]
Only include options whose URL appeared in your search results. Use Australian English.`;
}

function parseItems(text) {
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return [];
  let raw;
  try {
    raw = JSON.parse(m[0]);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x.url === "string" && /^https?:\/\//i.test(x.url))
    .slice(0, 5)
    .map((x) => ({
      title: clean(x.title, 80),
      location: clean(x.location, 60),
      price: x.price ? clean(x.price, 40) : null,
      why: clean(x.why, 160),
      url: x.url.trim().slice(0, 500),
    }));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST" });
  }
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "ai_not_configured" });
  // Only your own website may use this (stops other sites spending your credits).
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ error: "Not allowed" });

  const { goal, near } = req.body || {};
  if (!goal || typeof goal.title !== "string") return res.status(400).json({ error: "Missing goal" });

  const tools = [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }];
  if (near?.label) tools[0].user_location = { type: "approximate", city: clean(near.label, 60), country: "AU" };

  const messages = [{ role: "user", content: prompt(goal, near) }];
  try {
    let response;
    for (let i = 0; i <= MAX_CONTINUATIONS; i++) {
      response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: "low" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        tools,
        messages,
      });
      if (response.stop_reason !== "pause_turn") break;
      // The server paused a long search; send its work back so it carries on.
      messages.splice(1, messages.length - 1, { role: "assistant", content: response.content });
    }
    if (response.stop_reason === "refusal") return res.status(200).json({ items: [], refused: true });
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return res.status(200).json({ items: parseItems(text) });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "rate_limited" });
    if (error instanceof Anthropic.APIError) return res.status(502).json({ error: `upstream_${error.status}` });
    return res.status(500).json({ error: "server_error" });
  }
}
