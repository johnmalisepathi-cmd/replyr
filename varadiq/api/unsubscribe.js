import { createClient } from "@supabase/supabase-js";
import { SITE, tokenOk } from "./_lib/watch.js";

// "Stop alert emails" link in every alert (GET from the link, POST from
// email apps' one-click unsubscribe). Turns alert emails off for that person.

const page = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:48px 16px;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
<div style="max-width:440px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
<p style="margin:0 0 12px;font-size:20px;font-weight:700">Varad<span style="color:#14b8a6">IQ</span></p>
<h1 style="margin:0 0 8px;font-size:22px">${title}</h1><p style="margin:0;color:#475569;line-height:1.6">${body}</p></div></body></html>`;

export default async function handler(req, res) {
  const u = String(req.query?.u || "");
  const t = String(req.query?.t || "");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (!/^[0-9a-f-]{36}$/i.test(u) || !tokenOk(u, t)) return res.status(400).send(page("That link didn't work", "Please use the link from your most recent VaradIQ email, or email hello@varadiq.com and we'll stop the alerts."));
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !process.env.VITE_SUPABASE_URL) return res.status(500).send(page("Something went wrong", "Please email hello@varadiq.com and we'll stop the alerts."));
  const db = createClient(process.env.VITE_SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await db.from("alert_prefs").upsert({ user_id: u, emails_off: true, updated_at: new Date().toISOString() });
  if (error) {
    console.error("unsubscribe failed", error.message);
    return res.status(500).send(page("Something went wrong", "Please try the link again, or email hello@varadiq.com and we'll stop the alerts."));
  }
  return res.status(200).send(page("Alert emails are off", `You won't get any more alert emails from VaradIQ. Your goals and plans are still saved. You can turn alerts back on any time in <a href="${SITE}/#/account" style="color:#7c3aed">your account</a>.`));
}
