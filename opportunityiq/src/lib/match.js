import { CONTRACT_BANDS } from "./data.js";

// Transparent, rule-based fit score. Every point is explained, so a customer
// can see WHY something matches. Weights sum to 100.
const WEIGHTS = { capability: 50, region: 15, size: 15, certification: 10, timing: 10 };

export function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / 86_400_000);
}

export function scoreOpportunity(op, profile) {
  const reasons = [];
  const gaps = [];
  let score = 0;

  // Capability overlap — the heart of the match.
  const have = new Set(profile.capabilities);
  const matched = op.needs.filter((n) => have.has(n));
  const missing = op.needs.filter((n) => !have.has(n));
  const capShare = op.needs.length ? matched.length / op.needs.length : 0;
  score += WEIGHTS.capability * capShare;
  if (matched.length) reasons.push(`You offer ${matched.join(", ")}`);
  if (missing.length) gaps.push(`Not in your profile: ${missing.join(", ")}`);

  // Travel distance from the business (op.distanceKm is measured from its
  // home city), with partial credit for its own region beyond that range.
  const range = profile.maxDistanceKm || 300;
  if (op.distanceKm <= range) {
    score += WEIGHTS.region;
    reasons.push(`Within your ${range} km range (${op.distanceKm.toLocaleString()} km away)`);
  } else if (op.region === profile.region) {
    score += WEIGHTS.region * 0.4;
    gaps.push(`${op.distanceKm.toLocaleString()} km away — beyond your ${range} km range`);
  } else {
    gaps.push(`Outside your service area: ${op.location}, ${op.distanceKm.toLocaleString()} km away`);
  }

  // Contract size vs. preferred band (one band either side earns partial credit).
  const bandIdx = CONTRACT_BANDS.findIndex((b) => b.id === profile.contractBand);
  const opIdx = CONTRACT_BANDS.findIndex((b) => op.value >= b.min && op.value < b.max);
  const diff = Math.abs(bandIdx - opIdx);
  score += diff === 0 ? WEIGHTS.size : diff === 1 ? WEIGHTS.size * 0.5 : 0;
  if (diff === 0) reasons.push("Contract size matches your preferred range");
  else if (diff > 1) gaps.push(`Estimated value (${formatMoney(op.value)}) is well outside your preferred range`);

  // Certifications.
  const certs = new Set(profile.certifications);
  const certMissing = op.certifications.filter((c) => !certs.has(c));
  const certShare = op.certifications.length ? 1 - certMissing.length / op.certifications.length : 1;
  score += WEIGHTS.certification * certShare;
  if (certMissing.length) gaps.push(`Check certification: ${certMissing.join(", ")}`);
  else if (op.certifications.length) reasons.push("You hold the listed certifications");

  // Time to respond. Early signals have no deadline, so they score neutral.
  const days = daysUntil(op.deadline);
  if (days === null) score += WEIGHTS.timing * 0.5;
  else if (days >= 10) score += WEIGHTS.timing;
  else if (days >= 5) {
    score += WEIGHTS.timing * 0.5;
    gaps.push(`Only ${days} days to respond`);
  } else gaps.push(`Closes in ${days} days — tight turnaround`);

  // Wrong industry entirely → cap the score.
  if (op.industry !== profile.industry && capShare === 0) score = Math.min(score, 15);

  return { score: Math.round(score), matched, missing, reasons, gaps };
}

export function fitLabel(score) {
  if (score >= 75) return { text: "High fit", tone: "bg-brand-100 text-brand-700" };
  if (score >= 50) return { text: "Possible fit", tone: "bg-amber-100 text-amber-800" };
  return { text: "Low fit", tone: "bg-slate-100 text-slate-600" };
}

export function formatMoney(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

// Plain-language search: "6-20 mm plate cutting within 250 km of Perth".
// Pulls out a distance limit and keywords; matches against title, needs and summary.
export function searchOpportunities(list, query) {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  const km = q.match(/(\d[\d,]*)\s*km/);
  const maxKm = km ? Number(km[1].replace(/,/g, "")) : null;
  const stop = new Set(["show", "me", "projects", "that", "need", "within", "of", "the", "and", "for", "in", "near", "km", "mm", "to", "a", "with"]);
  const words = q
    .replace(/(\d[\d,]*)\s*km/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  return list.filter((op) => {
    if (maxKm !== null && op.distanceKm > maxKm) return false;
    if (!words.length) return true;
    const hay = `${op.title} ${op.needs.join(" ")} ${op.summary} ${op.location} ${op.extraction.Materials}`.toLowerCase();
    return words.some((w) => hay.includes(w));
  });
}
