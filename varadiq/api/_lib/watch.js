import crypto from "node:crypto";

// Helpers for the daily watch: where a person is, signed "stop alerts" links,
// and the alert email itself.

export const SITE = (process.env.SITE_URL || "https://www.varadiq.com").replace(/\/$/, "");

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function englishFor(code) {
  if (code === "AU") return "Australian English";
  if (code === "US" || code === "PH") return "American English";
  if (code === "CA") return "Canadian English";
  return "British English";
}
function countryName(code) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

/** The same "near" details the website sends with a live search, from a saved profile. */
export function nearOf(profile = {}) {
  const country = /^[A-Z]{2}$/.test(profile.country || "") ? profile.country : "AU";
  return {
    label: profile.home?.label || "",
    country,
    countryName: countryName(country),
    currency: /^[A-Z]{3}$/.test(profile.currency || "") ? profile.currency : undefined,
    english: englishFor(country),
  };
}

/** A goal is watched if the person turned watching on and it isn't over. */
export function isWatched(goal, now = Date.now()) {
  if (!goal?.watch || goal.type === "money") return false;
  const when = goal.when ? new Date(goal.when).getTime() : NaN;
  return !Number.isFinite(when) || when > now - 2 * 86_400_000;
}

/** Signed token for a person's "Stop alerts" link, so nobody can switch off someone else's. */
export function unsubToken(userId) {
  return crypto.createHmac("sha256", process.env.CRON_SECRET || "").update(String(userId)).digest("hex").slice(0, 32);
}
export function tokenOk(userId, token) {
  const want = Buffer.from(unsubToken(userId));
  const got = Buffer.from(String(token || ""));
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
export const unsubUrl = (userId) => `${SITE}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubToken(userId)}`;

/**
 * The alert email for one person. entries: [{ goal, lines: [{ headline, item }] }]
 * Returns { subject, html, text }.
 */
export function alertEmail(userId, entries) {
  const first = entries[0];
  const subject = entries.length === 1 ? `${first.lines[0].headline}` : `${entries.length} goals have news: ${first.lines[0].headline}`;
  const blocks = entries
    .map(({ goal, lines }) => {
      const rows = lines
        .map(
          ({ headline, item }) => `
        <div style="margin:0 0 14px;padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px">
          <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#0f172a">${esc(headline)}</p>
          <p style="margin:0 0 10px;font-size:14px;color:#475569">${esc([item.title, item.location, item.price].filter(Boolean).join(" · "))}</p>
          <a href="${esc(item.url)}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:9px 16px;border-radius:10px">View &amp; book →</a>
        </div>`
        )
        .join("");
      return `
      <h2 style="margin:22px 0 10px;font-size:18px;color:#0f172a">${esc(goal.title)}</h2>
      ${rows}
      <a href="${SITE}/#/goal/${encodeURIComponent(goal.id)}" style="font-size:14px;color:#7c3aed;font-weight:600;text-decoration:none">Open your plan →</a>`;
    })
    .join("");
  const html = `<div style="margin:0;padding:32px 16px;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#0b1530;padding:20px 28px">
      <span style="font-size:20px;font-weight:700;color:#ffffff">Varad<span style="color:#2dd4bf">IQ</span></span>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0;font-size:15px;line-height:1.6;color:#475569">Your agent searched the web for your goals this morning. Here's what's new:</p>
      ${blocks}
      <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#94a3b8">Found by AI on public websites. Prices and availability change, so confirm on the provider's site before you book or buy. VaradIQ never books or pays for you.</p>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8">
      You get these emails because you asked VaradIQ to watch your goals. <a href="${unsubUrl(userId)}" style="color:#94a3b8">Stop alert emails</a>
    </div>
  </div>
</div>`;
  const text = [
    "Your agent searched the web for your goals this morning. Here's what's new:",
    ...entries.flatMap(({ goal, lines }) => ["", goal.title, ...lines.map(({ headline, item }) => `- ${headline}\n  ${item.title} ${item.price || ""}\n  ${item.url}`), `Open your plan: ${SITE}/#/goal/${goal.id}`]),
    "",
    `Stop alert emails: ${unsubUrl(userId)}`,
  ].join("\n");
  return { subject: subject.slice(0, 120), html, text };
}

/** Sends one email through Resend. Throws on failure. */
export async function sendEmail({ to, subject, html, text, unsubscribe }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ALERTS_FROM || "VaradIQ <alerts@varadiq.com>",
      to: [to],
      reply_to: "hello@varadiq.com",
      subject,
      html,
      text,
      headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }),
  });
  if (!res.ok) throw new Error(`email failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
}
