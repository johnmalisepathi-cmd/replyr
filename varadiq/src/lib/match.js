import { distanceKm } from "./geo.js";

// Transparent fit score for a find against one goal. Every point is
// explained, so people can see WHY the assistant suggested it.
// Weights: budget 40, preferences 30, place 20, quality 10.

export function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / 86_400_000);
}

export function formatMoney(n) {
  if (n === null || n === undefined) return "";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 10_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n).toLocaleString("en-AU")}`;
}

export const priceOf = (find) => find.priceLabel || formatMoney(find.value);

export function scoreFind(find, goal, home) {
  const reasons = [];
  const gaps = [];
  let score = 0;

  // Budget: only for finds that have a price comparable to the goal's budget.
  const priced = find.kind === "option" && typeof find.value === "number" && goal.budget && !find.priceLabel?.includes("Save") && !find.priceLabel?.includes("%");
  if (priced) {
    if (find.value <= goal.budget) {
      score += 40;
      reasons.push(`Within your budget (${priceOf(find)})`);
    } else if (find.value <= goal.budget * 1.1) {
      score += 20;
      gaps.push(`A little over budget (${priceOf(find)})`);
    } else gaps.push(`Over your budget (${priceOf(find)})`);
  } else score += find.kind === "watch" ? 30 : 34;

  // Preferences: words from the wish that the find matches.
  const prefs = (goal.prefs || []).map((p) => p.toLowerCase());
  const hay = `${find.title} ${find.tags.join(" ")} ${find.tag}`.toLowerCase();
  const hits = prefs.filter((p) => hay.includes(p));
  if (prefs.length) {
    score += 30 * (hits.length / prefs.length);
    if (hits.length) reasons.push(`Has what you asked for: ${hits.join(", ")}`);
    const missing = prefs.filter((p) => !hits.includes(p));
    if (missing.length && find.kind === "option") gaps.push(`Doesn't mention: ${missing.join(", ")}`);
  } else score += 20;

  // Place: near you for local goals, in your chosen destination for travel.
  const where = (goal.location || "").toLowerCase();
  if (goal.type === "dining" && home) {
    const km = distanceKm(home, find);
    score += km <= 2 ? 20 : km <= 5 ? 14 : 6;
    reasons.push(`${km < 1 ? "Under 1" : km.toFixed(1)} km away`);
  } else if (where && hay.concat(" ", find.location.toLowerCase(), " ", find.region.toLowerCase()).includes(where.split(" ")[0])) {
    score += 20;
    reasons.push(`In ${goal.location}`);
  } else if (goal.type === "holiday" && where) {
    score += 10;
    gaps.push(`An alternative to ${goal.location}`);
  } else score += 14;

  // Quality.
  if (find.rating >= 4.6) {
    score += 10;
    reasons.push(`Rated ${find.rating} ★`);
  } else if (find.rating) score += 6;
  else score += 6;

  return { score: Math.round(Math.min(100, score)), reasons, gaps };
}

export function fitLabel(score) {
  if (score >= 75) return { text: "Great match", tone: "bg-brand-100 text-brand-700" };
  if (score >= 50) return { text: "Good option", tone: "bg-amber-100 text-amber-800" };
  return { text: "Worth a look", tone: "bg-slate-100 text-slate-600" };
}

/** Monthly repayment for a loan (principal and interest). */
export function monthlyRepayment(principal, annualRatePct, years = 30) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (!r) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

// Keyword search for when live AI isn't connected.
export function searchFinds(list, query) {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  const stop = new Set(["show", "me", "the", "and", "for", "with", "near", "a", "an", "to", "of", "in", "my", "what", "best", "find", "under", "about"]);
  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !stop.has(w));
  return list.filter((f) => {
    if (!words.length) return true;
    const hay = `${f.title} ${f.tags.join(" ")} ${f.location} ${f.tag}`.toLowerCase();
    return words.some((w) => hay.includes(w));
  });
}
