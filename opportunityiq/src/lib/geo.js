import { OPPORTUNITIES } from "./data.js";

// Where a business "is" for distance purposes: the main city of its region.
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

export function homeOf(profile) {
  return REGION_HOME[profile?.region] || REGION_HOME["Western Australia"];
}

/** Great-circle distance in km. */
export function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Every opportunity with its distance measured from this business. */
export function opportunitiesFor(profile) {
  const home = homeOf(profile);
  return OPPORTUNITIES.map((op) => ({ ...op, distanceKm: Math.max(1, Math.round(distanceKm(home, op) / 5) * 5) }));
}

export const COUNTRY_COUNT = new Set(OPPORTUNITIES.map((o) => countryOf(o.region))).size;
