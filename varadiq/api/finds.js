import Anthropic from "@anthropic-ai/sdk";

// VaradIQ's live web search (a Vercel serverless function at /api/finds).
// The website sends { goal, near } and gets back { items: [...] }: real places,
// products or offers found on the web for that goal, each with a link to the
// provider's own page. The API key stays here on the server.

export const config = { maxDuration: 60 };

// Keep each call inside Vercel's 60-second limit, so a slow search reports a
// clear "timeout" instead of being cut off.
const client = new Anthropic({ timeout: 50_000, maxRetries: 0 });
const STOP_AFTER_MS = 35_000;
const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
const MAX_CONTINUATIONS = 3;

// Live search limits (supabase/limits.sql): signed-in people only, a few
// searches each per day, and a cap for everyone together. Uses the public
// Supabase settings; the person's own sign-in token proves who they are.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

/** Counts one live search for this person, or says why they can't search. */
async function useSearch(token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/use_live_search`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  });
  if (res.status === 401 || res.status === 403) return { ok: false, reason: "signin" };
  if (!res.ok) throw new Error(`limits check failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const clean = (v, n = 120) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
// The person's country, currency and spelling, as sent by the website (with safe defaults).
const country = (near) => clean(near?.countryName, 60) || "their country";
const cur = (near) => (/^[A-Z]{3}$/.test(near?.currency || "") ? near.currency : "local currency");
const english = (near) => clean(near?.english, 30) || "clear, simple English";

function describe(goal, near) {
  const parts = [
    `Goal: ${clean(goal.title, 60)} (${clean(goal.type, 20)}).`,
    goal.wish ? `In their words: "${clean(goal.wish, 240)}".` : "",
    goal.budget ? `Budget: about ${cur(near)} ${Number(goal.budget).toLocaleString("en-US")}${goal.type === "dining" ? " per person" : ""}.` : "Budget: not set.",
    goal.when ? `Needed by: ${clean(goal.when, 10)}.` : "",
    goal.location ? `Place: ${clean(goal.location, 60)}.` : "",
    goal.prefs?.length ? `What matters: ${goal.prefs.map((p) => clean(p, 20)).join(", ")}.` : "",
    `The person lives near ${clean(near?.label || "", 60) || "the main city"}, ${country(near)}.`,
  ];
  return parts.filter(Boolean).join(" ");
}

function prompt(goal, near) {
  return `Search the web for the best current options for this person's goal, then reply.

${describe(goal, near)}

Find 3 to 5 real, specific options available now (for example hotels or flights for a trip, restaurants open near them, products in stock at stores that sell in ${country(near)}, homes or cars for sale, energy plans). For travel, search the destination, with flights from their nearest city. For everything else (restaurants, shops, homes, cars, bills), search in the goal's Place if one is given, otherwise near where they live. Show prices in ${cur(near)} where the site does, otherwise as published. Prefer options that fit the budget and what matters to them, and the official provider or booking page for each.

Reply with ONLY a JSON array, no other text:
[{"title": string (max 70 chars), "location": string (suburb, city or store/website name), "price": string or null (as published, e.g. "From $189/night" or "$1,099"), "why": string (one short sentence on why it fits), "url": string (the exact page URL from your search results where they can view or book it), "lat": number or null, "lng": number or null (approximate latitude/longitude of the place, its city, or the destination; null for online-only stores)}]
Only include options whose URL appeared in your search results. Write in ${english(near)}.`;
}

// Keeps a latitude/longitude pair only if both are real numbers in range.
function coords(x) {
  const lat = Number(x.lat);
  const lng = Number(x.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat || lng) ? { lat, lng } : {};
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
      ...coords(x),
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

  // Who is searching, and are they within today's limits?
  let quota = null;
  if (SUPABASE_URL && SUPABASE_KEY) {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "signin" });
    try {
      quota = await useSearch(token);
    } catch (error) {
      console.error(error.message);
      return res.status(503).json({ error: "limits_unavailable" });
    }
    if (!quota.ok) {
      if (quota.reason === "signin") return res.status(401).json({ error: "signin" });
      return res.status(429).json({ error: quota.reason === "person" ? "daily_limit" : "busy_today", limit: quota.limit });
    }
  } else {
    console.warn("Live search limits are off: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set.");
  }
  const left = quota ? Math.max(0, quota.limit - quota.used) : null;

  const tools = [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }];
  // Lets web search favour results near the person.
  const loc = { type: "approximate" };
  if (near?.label) loc.city = clean(near.label, 60);
  if (/^[A-Z]{2}$/.test(near?.country || "")) loc.country = near.country;
  if (typeof near?.timezone === "string" && /^[A-Za-z_]+\/[A-Za-z_/+-]+$/.test(near.timezone)) loc.timezone = near.timezone;
  // If the goal names somewhere else to buy (e.g. a phone in Singapore), don't bias the search to home.
  if ((loc.city || loc.country) && near?.elsewhere !== true) tools[0].user_location = loc;

  const messages = [{ role: "user", content: prompt(goal, near) }];
  const started = Date.now();
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
      if (response.stop_reason !== "pause_turn" || Date.now() - started > STOP_AFTER_MS) break;
      // The server paused a long search; send its work back so it carries on.
      messages.splice(1, messages.length - 1, { role: "assistant", content: response.content });
    }
    if (response.stop_reason === "refusal") return res.status(200).json({ items: [], refused: true, left });
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return res.status(200).json({ items: parseItems(text), left });
  } catch (error) {
    // Shows in Vercel → Logs, so we can see why a search failed.
    console.error("finds failed:", error?.status ?? "", error?.message ?? error);
    const detail = String(error?.error?.error?.message || error?.message || "").slice(0, 200);
    if (error instanceof Anthropic.APIConnectionTimeoutError) return res.status(504).json({ error: "timeout" });
    if (error instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "rate_limited" });
    if (error instanceof Anthropic.APIError) return res.status(502).json({ error: `upstream_${error.status}`, detail });
    return res.status(500).json({ error: "server_error", detail });
  }
}
