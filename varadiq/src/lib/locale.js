// Each visitor's country, currency and style of English. Detected from their
// browser (language and time zone) the first time, and changeable in the
// country/currency picker. Saved in the profile, in this browser only.

// code, currency, main city (used for distances until a location is set).
const C = (code, currency, city, lat, lng) => ({ code, currency, city, lat, lng });
export const COUNTRIES = [
  C("AU", "AUD", "Sydney", -33.87, 151.21), C("NZ", "NZD", "Auckland", -36.85, 174.76),
  C("US", "USD", "New York", 40.71, -74.01), C("CA", "CAD", "Toronto", 43.65, -79.38),
  C("GB", "GBP", "London", 51.51, -0.13), C("IE", "EUR", "Dublin", 53.35, -6.26),
  C("IN", "INR", "Mumbai", 19.08, 72.88), C("AE", "AED", "Dubai", 25.2, 55.27),
  C("SA", "SAR", "Riyadh", 24.71, 46.68), C("QA", "QAR", "Doha", 25.29, 51.53),
  C("SG", "SGD", "Singapore", 1.35, 103.82), C("MY", "MYR", "Kuala Lumpur", 3.14, 101.69),
  C("ID", "IDR", "Jakarta", -6.21, 106.85), C("PH", "PHP", "Manila", 14.6, 120.98),
  C("TH", "THB", "Bangkok", 13.76, 100.5), C("VN", "VND", "Ho Chi Minh City", 10.82, 106.63),
  C("JP", "JPY", "Tokyo", 35.68, 139.69), C("KR", "KRW", "Seoul", 37.57, 126.98),
  C("CN", "CNY", "Shanghai", 31.23, 121.47), C("HK", "HKD", "Hong Kong", 22.32, 114.17),
  C("TW", "TWD", "Taipei", 25.03, 121.57), C("PK", "PKR", "Karachi", 24.86, 67.01),
  C("BD", "BDT", "Dhaka", 23.81, 90.41), C("LK", "LKR", "Colombo", 6.93, 79.86),
  C("NP", "NPR", "Kathmandu", 27.72, 85.32), C("DE", "EUR", "Berlin", 52.52, 13.4),
  C("FR", "EUR", "Paris", 48.86, 2.35), C("ES", "EUR", "Madrid", 40.42, -3.7),
  C("IT", "EUR", "Rome", 41.9, 12.5), C("NL", "EUR", "Amsterdam", 52.37, 4.9),
  C("BE", "EUR", "Brussels", 50.85, 4.35), C("PT", "EUR", "Lisbon", 38.72, -9.14),
  C("GR", "EUR", "Athens", 37.98, 23.73), C("AT", "EUR", "Vienna", 48.21, 16.37),
  C("CH", "CHF", "Zurich", 47.38, 8.54), C("SE", "SEK", "Stockholm", 59.33, 18.07),
  C("NO", "NOK", "Oslo", 59.91, 10.75), C("DK", "DKK", "Copenhagen", 55.68, 12.57),
  C("FI", "EUR", "Helsinki", 60.17, 24.94), C("PL", "PLN", "Warsaw", 52.23, 21.01),
  C("TR", "TRY", "Istanbul", 41.01, 28.98), C("IL", "ILS", "Tel Aviv", 32.09, 34.78),
  C("EG", "EGP", "Cairo", 30.04, 31.24), C("ZA", "ZAR", "Johannesburg", -26.2, 28.05),
  C("NG", "NGN", "Lagos", 6.52, 3.38), C("KE", "KES", "Nairobi", -1.29, 36.82),
  C("BR", "BRL", "São Paulo", -23.55, -46.63), C("MX", "MXN", "Mexico City", 19.43, -99.13),
  C("AR", "ARS", "Buenos Aires", -34.6, -58.38), C("CL", "CLP", "Santiago", -33.45, -70.67),
  C("CO", "COP", "Bogotá", 4.71, -74.07), C("FJ", "FJD", "Suva", -18.14, 178.44),
];
const BY_CODE = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

// Australian state capitals, so distances start from the right city in Australia.
const AU_ZONE_CITY = {
  "Australia/Perth": ["Perth", -31.95, 115.86], "Australia/Adelaide": ["Adelaide", -34.93, 138.6],
  "Australia/Darwin": ["Darwin", -12.46, 130.84], "Australia/Brisbane": ["Brisbane", -27.47, 153.03],
  "Australia/Melbourne": ["Melbourne", -37.81, 144.96], "Australia/Hobart": ["Hobart", -42.88, 147.33],
  "Australia/Sydney": ["Sydney", -33.87, 151.21],
};

// Common time zones, for when the browser language doesn't name a country (e.g. "en").
const ZONE_COUNTRY = {
  "Pacific/Auckland": "NZ", "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
  "America/Phoenix": "US", "America/Anchorage": "US", "Pacific/Honolulu": "US", "America/Toronto": "CA", "America/Vancouver": "CA",
  "America/Edmonton": "CA", "America/Winnipeg": "CA", "America/Halifax": "CA", "Europe/London": "GB", "Europe/Dublin": "IE",
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Qatar": "QA", "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY", "Asia/Jakarta": "ID", "Asia/Makassar": "ID", "Asia/Manila": "PH", "Asia/Bangkok": "TH",
  "Asia/Ho_Chi_Minh": "VN", "Asia/Tokyo": "JP", "Asia/Seoul": "KR", "Asia/Shanghai": "CN", "Asia/Hong_Kong": "HK", "Asia/Taipei": "TW",
  "Asia/Karachi": "PK", "Asia/Dhaka": "BD", "Asia/Colombo": "LK", "Asia/Kathmandu": "NP", "Europe/Berlin": "DE", "Europe/Paris": "FR",
  "Europe/Madrid": "ES", "Europe/Rome": "IT", "Europe/Amsterdam": "NL", "Europe/Brussels": "BE", "Europe/Lisbon": "PT",
  "Europe/Athens": "GR", "Europe/Vienna": "AT", "Europe/Zurich": "CH", "Europe/Stockholm": "SE", "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK", "Europe/Helsinki": "FI", "Europe/Warsaw": "PL", "Europe/Istanbul": "TR", "Asia/Jerusalem": "IL",
  "Africa/Cairo": "EG", "Africa/Johannesburg": "ZA", "Africa/Lagos": "NG", "Africa/Nairobi": "KE", "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX", "America/Argentina/Buenos_Aires": "AR", "America/Santiago": "CL", "America/Bogota": "CO", "Pacific/Fiji": "FJ",
};

const zone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
};

/** Best guess of the visitor's country and currency, from browser settings. */
export function detectLocale() {
  const tz = zone();
  let code = tz.startsWith("Australia/") ? "AU" : ZONE_COUNTRY[tz];
  if (!code) {
    const langs = typeof navigator !== "undefined" ? navigator.languages || [navigator.language] : [];
    for (const l of langs) {
      const region = (l || "").split("-")[1]?.toUpperCase();
      if (region && BY_CODE[region]) {
        code = region;
        break;
      }
    }
  }
  code = code || "US";
  return { country: code, currency: BY_CODE[code]?.currency || "USD", timezone: tz };
}

let names;
/** A country's name in English, e.g. "GB" -> "United Kingdom". */
export function countryName(code) {
  try {
    names = names || new Intl.DisplayNames(["en"], { type: "region" });
    return names.of(code) || code;
  } catch {
    return code;
  }
}

/** Currencies to offer in the picker: the listed countries' currencies, sorted. */
export const CURRENCIES = [...new Set(COUNTRIES.map((c) => c.currency))].sort();

export function englishFor(code) {
  if (code === "AU") return "Australian English";
  if (code === "US" || code === "PH") return "American English";
  if (code === "CA") return "Canadian English";
  return "British English";
}

/** The profile's locale, filling gaps from the browser. */
export function localeOf(profile) {
  const d = detectLocale();
  const country = profile?.country || d.country;
  return {
    country,
    countryName: countryName(country),
    currency: profile?.currency || BY_CODE[country]?.currency || d.currency,
    english: englishFor(country),
    timezone: d.timezone,
  };
}

/** Where distances start when no location is set: the time zone's or country's main city. */
export function defaultHome(profile) {
  const { country } = localeOf(profile);
  if (country === "AU") {
    const [city, lat, lng] = AU_ZONE_CITY[zone()] || AU_ZONE_CITY["Australia/Sydney"];
    return { lat, lng, city };
  }
  const c = BY_CODE[country] || BY_CODE.US;
  return { lat: c.lat, lng: c.lng, city: c.city };
}

/** Money in the person's currency, e.g. 1240 -> "£1,240", 750000 -> "₹7.5L"-style compact. */
export function money(amount, currency = "AUD", { compact = false } = {}) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return "";
  const n = Number(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: compact && Math.abs(n) >= 10_000 ? 1 : 0,
      notation: compact && Math.abs(n) >= 10_000 ? "compact" : "standard",
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n).toLocaleString()}`;
  }
}

/** Symbol only, for labels like "Budget (£)". */
export function currencySymbol(currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, currencyDisplay: "narrowSymbol" }).formatToParts(0).find((p) => p.type === "currency")?.value || currency;
  } catch {
    return currency;
  }
}

// The current visitor's locale, set by the app whenever the profile changes,
// so AI prompts and money labels don't need it passed through every call.
let current = null;
export const setCurrentLocale = (profile) => (current = localeOf(profile));
export const currentLocale = () => current || localeOf(null);
/** Money in the current visitor's currency. */
export const myMoney = (amount, opts) => money(amount, currentLocale().currency, opts);
