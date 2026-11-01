import { FINDS } from "./goals.js";
import { scoreFind } from "./match.js";
import { defaultHome, localeOf } from "./locale.js";

// Where a person "is" for distance purposes: the main city of their region.
export const REGION_HOME = {
  "Western Australia": { lat: -31.95, lng: 115.86, city: "Perth" },
  "New South Wales": { lat: -33.87, lng: 151.21, city: "Sydney" },
  Victoria: { lat: -37.81, lng: 144.96, city: "Melbourne" },
  Queensland: { lat: -27.47, lng: 153.03, city: "Brisbane" },
  "South Australia": { lat: -34.93, lng: 138.6, city: "Adelaide" },
  Tasmania: { lat: -42.88, lng: 147.33, city: "Hobart" },
  "Northern Territory": { lat: -12.46, lng: 130.84, city: "Darwin" },
  ACT: { lat: -35.28, lng: 149.13, city: "Canberra" },
  "New Zealand": { lat: -36.85, lng: 174.76, city: "Auckland" },
  Singapore: { lat: 1.35, lng: 103.82, city: "Singapore" },
  India: { lat: 19.08, lng: 72.88, city: "Mumbai" },
  "United Arab Emirates": { lat: 25.2, lng: 55.27, city: "Dubai" },
  "United Kingdom": { lat: 51.51, lng: -0.13, city: "London" },
  "United States": { lat: 29.76, lng: -95.37, city: "Houston" },
  Canada: { lat: 49.28, lng: -123.12, city: "Vancouver" },
};

const AU_STATES = new Set(["Western Australia", "New South Wales", "Victoria", "Queensland", "South Australia", "Tasmania", "Northern Territory", "ACT"]);

export const countryOf = (region) => (AU_STATES.has(region) ? "Australia" : region);

// Countries that measure road distances in miles.
const MILES = new Set(["US", "GB", "LR", "MM"]);

/** Where distances are measured from: the person's saved location, else their country's main city. */
export function homeOf(profile) {
  const units = MILES.has(localeOf(profile).country) ? "mi" : "km";
  const h = profile?.home;
  if (h && Number.isFinite(h.lat) && Number.isFinite(h.lng)) return { lat: h.lat, lng: h.lng, city: h.label || "your location", units };
  return { ...defaultHome(profile), units };
}

/** Great-circle distance in km. */
export function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Every find, matched to the person's goals and scored, best first. */
export function findsFor(profile) {
  const home = homeOf(profile);
  const out = [];
  for (const goal of profile?.goals || []) {
    for (const find of FINDS.filter((x) => x.type === goal.type)) {
      const s = scoreFind(find, goal, home);
      out.push({ op: { ...find, distanceKm: Math.round(distanceKm(home, find) * 10) / 10 }, goal, ...s });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

export const COUNTRY_COUNT = new Set(FINDS.map((o) => countryOf(o.region))).size;

/** Whether a sample find suits its goal: a trip's must be in its destination;
 *  local goals (dinner, homes, cars) only within 100 km of the person. */
export function fitsGoal(s) {
  const goal = s.goal;
  if (goal.type === "holiday") {
    const where = (goal.location || "").toLowerCase().split(",")[0].trim();
    return !!where && `${s.op.location} ${s.op.region} ${s.op.title} ${(s.op.tags || []).join(" ")}`.toLowerCase().includes(where);
  }
  if (["dining", "home", "car"].includes(goal.type)) return s.op.distanceKm <= 100;
  return true;
}
