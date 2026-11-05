import Anthropic from "@anthropic-ai/sdk";

// The web search shared by live search (api/finds.js) and the daily watch
// (api/cron/watch.js): Claude searches the web for a goal and returns real
// options with links. Files in api/_lib are not web addresses themselves.

const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
const MAX_CONTINUATIONS = 3;

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

export function prompt(goal, near) {
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

export function parseItems(text) {
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


// The daily watch also gets what was found last time, and says what's new or cheaper.
function watchPrompt(goal, near, previous) {
  const prev = previous.length
    ? previous.map((p, i) => `${i + 1}. ${clean(p.title, 80)} | ${clean(p.price || "price not shown", 40)} | ${clean(p.url, 200)}`).join("\n")
    : "(nothing yet: this is the first check)";
  return prompt(goal, near).replace(/Reply with ONLY a JSON array[\s\S]*$/, `Last time, these options were found:
${prev}

Reply with ONLY a JSON object, no other text:
{"items": [the 3 to 5 best options now, each {"title", "location", "price", "why", "url", "lat", "lng"} as described: title max 70 chars, price as published or null, why one short sentence, url the exact page URL from your search results, lat/lng approximate or null],
 "news": [only real improvements since last time, each {"item": index into items (0-based), "headline": string (max 80 chars, e.g. "Perth → Tokyo flights down to A$940 (was A$1,040)")}; an empty array if nothing is cheaper or better]}
Only include options whose URL appeared in your search results. A price drop counts only for the same product, trip or listing. Write in ${english(near)}.`);
}

function parseWatch(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return { items: [], news: [] };
  let raw;
  try {
    raw = JSON.parse(m[0]);
  } catch {
    return { items: [], news: [] };
  }
  const items = parseItems(JSON.stringify(Array.isArray(raw.items) ? raw.items : []));
  const news = (Array.isArray(raw.news) ? raw.news : [])
    .filter((n) => n && Number.isInteger(n.item) && items[n.item] && typeof n.headline === "string")
    .slice(0, 3)
    .map((n) => ({ item: n.item, headline: clean(n.headline, 100) }));
  return { items, news };
}

function searchTools(near) {
  const tools = [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }];
  // Lets web search favour results near the person.
  const loc = { type: "approximate" };
  if (near?.label) loc.city = clean(near.label, 60);
  if (/^[A-Z]{2}$/.test(near?.country || "")) loc.country = near.country;
  if (typeof near?.timezone === "string" && /^[A-Za-z_]+\/[A-Za-z_/+-]+$/.test(near.timezone)) loc.timezone = near.timezone;
  // If the goal names somewhere else to buy (e.g. a phone in Singapore), don't bias the search to home.
  if ((loc.city || loc.country) && near?.elsewhere !== true) tools[0].user_location = loc;
  return tools;
}

/**
 * Searches the web for a goal. With `previous` (an array, possibly empty) it
 * runs as the daily watch and also returns `news`. Resolves
 * { items, news?, refused? }; throws the SDK's errors.
 */
export async function searchGoal(client, goal, near, { previous = null, stopAfterMs = 35_000 } = {}) {
  const watching = Array.isArray(previous);
  const messages = [{ role: "user", content: watching ? watchPrompt(goal, near, previous) : prompt(goal, near) }];
  const tools = searchTools(near);
  const started = Date.now();
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
    if (response.stop_reason !== "pause_turn" || Date.now() - started > stopAfterMs) break;
    // The server paused a long search; send its work back so it carries on.
    messages.splice(1, messages.length - 1, { role: "assistant", content: response.content });
  }
  if (response.stop_reason === "refusal") return { items: [], news: [], refused: true };
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return watching ? parseWatch(text) : { items: parseItems(text) };
}

export { Anthropic };
