// Where distances are measured from. People can share their device location
// (with the browser's permission) or type a suburb or postcode. The result is
// kept in the profile, in this browser only.
//
// Suburb lookups and place names use OpenStreetMap's free Nominatim service,
// one request per lookup (never in a loop).

const NOMINATIM = "https://nominatim.openstreetmap.org";

/** Asks the browser for the device location. Resolves {lat, lng} or rejects {code}. */
export function deviceLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject({ code: "unsupported" });
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject({ code: err.code === 1 ? "denied" : "unavailable" }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

/** The suburb or town name and country for a point; {label: "", country: ""} if unknown. */
export async function placeName({ lat, lng }) {
  try {
    const res = await fetch(`${NOMINATIM}/reverse?format=json&zoom=14&lat=${lat}&lon=${lng}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return { label: "", country: "" };
    const a = (await res.json()).address || {};
    return { label: a.suburb || a.town || a.city_district || a.city || a.village || "", country: (a.country_code || "").toUpperCase() };
  } catch {
    return { label: "", country: "" };
  }
}

async function search(q, country) {
  const cc = country ? `&countrycodes=${country.toLowerCase()}` : "";
  const res = await fetch(`${NOMINATIM}/search?format=json&limit=1&addressdetails=1${cc}&q=${encodeURIComponent(q)}`, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const [hit] = await res.json();
  return hit || null;
}

/**
 * Looks up a suburb, city or postcode: in the person's country first, then
 * anywhere in the world. Resolves {lat, lng, label, country} or null.
 */
export async function lookupPlace(text, country) {
  const q = text.trim();
  if (!q) return null;
  try {
    const hit = (country && (await search(q, country))) || (await search(q));
    if (!hit) return null;
    const a = hit.address || {};
    const label = a.suburb || a.town || a.city || a.village || hit.display_name.split(",")[0];
    return {
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      label: a.postcode && !label.includes(a.postcode) ? `${label} ${a.postcode}` : label,
      country: (a.country_code || "").toUpperCase(),
    };
  } catch {
    return null;
  }
}

/** "2.4 km" or "1.5 mi", depending on the country's units. */
export function formatKm(km, units = "km") {
  const v = units === "mi" ? km * 0.621371 : km;
  return `${v < 10 ? v.toFixed(1) : Math.round(v).toLocaleString()} ${units}`;
}
