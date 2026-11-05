import { createClient } from "@supabase/supabase-js";
import { Anthropic, searchGoal } from "../_lib/search.js";
import { alertEmail, isWatched, nearOf, sendEmail, unsubUrl } from "../_lib/watch.js";

// The daily watch (a Vercel Cron Job, see vercel.json). Every morning it:
// 1. finds the goals people asked VaradIQ to watch (within the limits in
//    app_settings: goals per person, checks per day for everyone),
// 2. searches the web again for each one, all at once,
// 3. saves the results (table goal_watch; the app shows them), and
// 4. emails each person once if something is cheaper or better.

export const config = { maxDuration: 60 };

const client = new Anthropic({ timeout: 45_000, maxRetries: 0 });
const DAY = 86_400_000;

const slim = (it) => ({ title: it.title, price: it.price, url: it.url });

export default async function handler(req, res) {
  // Vercel sends "Authorization: Bearer <CRON_SECRET>" with each cron run.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "Not allowed" });
  const missing = ["ANTHROPIC_API_KEY", "VITE_SUPABASE_URL", "RESEND_API_KEY"].filter((k) => !process.env[k]);
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) missing.push("SUPABASE_SECRET_KEY");
  if (missing.length) return res.status(500).json({ error: "not_configured", missing });

  const db = createClient(process.env.VITE_SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const now = Date.now();
  const todayStart = new Date(new Date(now).toISOString().slice(0, 10)).toISOString();

  const [settings, states, watches, prefs] = await Promise.all([
    db.from("app_settings").select("key,value"),
    db.from("user_state").select("user_id,data"),
    db.from("goal_watch").select("*"),
    db.from("alert_prefs").select("user_id").eq("emails_off", true),
  ]);
  const failed = [settings, states, watches, prefs].find((r) => r.error);
  if (failed) {
    console.error("watch: database read failed", failed.error.message);
    return res.status(500).json({ error: "database", detail: failed.error.message });
  }
  const setting = (k, d) => settings.data.find((s) => s.key === k)?.value ?? d;
  const perPerson = setting("watched_goals_per_person", 2);
  let left = setting("auto_checks_per_day_total", 30) - watches.data.filter((w) => w.checked_at >= todayStart).length;
  const off = new Set(prefs.data.map((p) => p.user_id));
  const watchOf = new Map(watches.data.map((w) => [`${w.user_id}:${w.goal_id}`, w]));

  // Which goals to check this morning.
  const due = [];
  for (const { user_id, data } of states.data) {
    if (off.has(user_id) || left <= 0) continue;
    const profile = data?.profile || {};
    for (const goal of (profile.goals || []).filter((g) => isWatched(g, now)).slice(0, perPerson)) {
      const prev = watchOf.get(`${user_id}:${goal.id}`);
      if (prev && now - new Date(prev.checked_at).getTime() < DAY * 0.8) continue; // already checked today
      if (left-- <= 0) break;
      const previous = (prev?.items?.length ? prev.items : data?.progress?.[goal.id]?.live?.items || []).map(slim);
      due.push({ user_id, profile, goal, prev, previous });
    }
  }

  // Search for all of them at the same time (each takes about 20–40 seconds).
  const results = await Promise.allSettled(due.map((d) => searchGoal(client, d.goal, nearOf(d.profile), { previous: d.previous, stopAfterMs: 28_000 })));

  const rows = [];
  const news = new Map(); // user_id -> [{ goal, lines }]
  results.forEach((r, i) => {
    const d = due[i];
    if (r.status !== "fulfilled") return console.error("watch: search failed", d.goal.id, r.reason?.status ?? "", r.reason?.message ?? r.reason);
    const { items = [], news: found = [] } = r.value;
    if (!items.length) return;
    let lines = found.map((n) => ({ headline: n.headline, item: items[n.item] }));
    // The first check confirms watching has started, with today's best option.
    if (!d.prev && !lines.length) lines = [{ headline: `Now watching "${d.goal.title}": today's best option`, item: items[0] }];
    if (lines.length) news.set(d.user_id, [...(news.get(d.user_id) || []), { goal: d.goal, lines }]);
    rows.push({
      user_id: d.user_id,
      goal_id: d.goal.id,
      checked_at: new Date(now).toISOString(),
      checks: (d.prev?.checks || 0) + 1,
      items,
      news: found,
      last_alert_at: lines.length ? new Date(now).toISOString() : d.prev?.last_alert_at || null,
    });
  });

  if (rows.length) {
    const { error } = await db.from("goal_watch").upsert(rows);
    if (error) console.error("watch: saving results failed", error.message);
  }

  // One email per person, only when there's news.
  let emailed = 0;
  await Promise.all(
    [...news].map(async ([userId, entries]) => {
      try {
        const { data, error } = await db.auth.admin.getUserById(userId);
        if (error || !data?.user?.email) throw new Error(error?.message || "no email");
        await sendEmail({ to: data.user.email, ...alertEmail(userId, entries), unsubscribe: unsubUrl(userId) });
        emailed++;
      } catch (e) {
        console.error("watch: email failed", userId, e.message);
      }
    })
  );

  const summary = { due: due.length, checked: rows.length, failed: results.filter((r) => r.status !== "fulfilled").length, emailed, leftToday: Math.max(0, left) };
  console.log("watch:", JSON.stringify(summary));
  return res.status(200).json(summary);
}
