import { Anthropic, searchGoal } from "./_lib/search.js";

// VaradIQ's live web search (a Vercel serverless function at /api/finds).
// The website sends { goal, near } and gets back { items: [...] }: real places,
// products or offers found on the web for that goal, each with a link to the
// provider's own page. The API key stays here on the server.

export const config = { maxDuration: 60 };

// Keep each call inside Vercel's 60-second limit, so a slow search reports a
// clear "timeout" instead of being cut off.
const client = new Anthropic({ timeout: 50_000, maxRetries: 0 });
const STOP_AFTER_MS = 35_000;

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

  try {
    const found = await searchGoal(client, goal, near, { stopAfterMs: STOP_AFTER_MS });
    if (found.refused) return res.status(200).json({ items: [], refused: true, left });
    return res.status(200).json({ items: found.items, left });
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
