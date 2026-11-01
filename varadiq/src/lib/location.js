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

/** The suburb or town name for a point, or "" if it can't be found. */
export async function placeName({ lat, lng }) {
  try {
    const res = await fetch(`${NOMINATIM}/reverse?format=json&zoom=14&lat=${lat}&lon=${lng}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return "";
    const a = (await res.json()).address || {};
    return a.suburb || a.town || a.city_district || a.city || a.village || "";
  } catch {
    return "";
  }
}

/** Looks up a suburb or postcode (Australia first). Resolves {lat, lng, label} or null. */
export async function lookupPlace(text, country = "au") {
  const q = text.trim();
  if (!q) return null;
  try {
    const res = await fetch(`${NOMINATIM}/search?format=json&limit=1&addressdetails=1&countrycodes=${country}&q=${encodeURIComponent(q)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const [hit] = await res.json();
    if (!hit) return null;
    const a = hit.address || {};
    const label = a.suburb || a.town || a.city || a.village || hit.display_name.split(",")[0];
    return { lat: Number(hit.lat), lng: Number(hit.lon), label: a.postcode && !label.includes(a.postcode) ? `${label} ${a.postcode}` : label };
  } catch {
    return null;
  }
}

export const formatKm = (km) => (km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km).toLocaleString("en-AU")} km`);
