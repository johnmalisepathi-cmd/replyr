import { useState } from "react";
import { homeOf } from "../lib/geo.js";
import { deviceLocation, lookupPlace, placeName } from "../lib/location.js";
import { COUNTRIES, CURRENCIES, countryName, currencySymbol, localeOf } from "../lib/locale.js";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ ...c, name: countryName(c.code) })).sort((a, b) => a.name.localeCompare(b.name));
const currencyOf = (code) => COUNTRIES.find((c) => c.code === code)?.currency;

// Asks where the person is: device location (browser permission) or a typed
// suburb/city/postcode, plus their country and currency. Until a location is
// set, distances are measured from the main city of their country.
export default function LocationCard({ profile, setProfile, compact = false }) {
  const home = homeOf(profile);
  const loc = localeOf(profile);
  const custom = !!profile.home;
  const [open, setOpen] = useState(!custom && !profile.locationAsked);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");

  // A located country updates the country, and the currency unless they picked one.
  const withCountry = (p, code) => (code && currencyOf(code) ? { ...p, country: code, currency: p.currencyChosen ? p.currency : currencyOf(code) } : p);

  const save = (h, country) => {
    setProfile(withCountry({ ...profile, home: h, locationAsked: true }, country));
    setOpen(false);
    setNote("");
  };

  const useDevice = async () => {
    setBusy("gps");
    setNote("");
    try {
      const pos = await deviceLocation();
      const place = await placeName(pos);
      save({ ...pos, label: place.label || "your location", source: "gps" }, place.country);
    } catch (e) {
      setNote(
        e.code === "denied"
          ? "Location is blocked for this site. Type your suburb or city instead, or allow location in your browser settings."
          : "I couldn't get your location just now. Type your suburb or city instead."
      );
    }
    setBusy("");
  };

  const useSuburb = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy("suburb");
    setNote("");
    const hit = await lookupPlace(text, loc.country);
    if (hit) save({ lat: hit.lat, lng: hit.lng, label: hit.label, source: "suburb" }, hit.country);
    else setNote(`I couldn't find "${text}". Try adding the city or country, e.g. "Camden, London" or "Bandra, Mumbai".`);
    setBusy("");
  };

  const summary = (
    <>
      <span aria-hidden="true">🌍</span>
      <span>
        {loc.countryName} · {currencySymbol(loc.currency)} {loc.currency}
      </span>
    </>
  );

  if (!open) {
    return (
      <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 ${compact ? "" : "mt-4"}`}>
        <span aria-hidden="true">📍</span>
        <span>
          Distances from <strong className="text-slate-900">{home.city}</strong>
          {!custom && " (main city)"}
        </span>
        <span className="text-slate-300" aria-hidden="true">|</span>
        {summary}
        <button onClick={() => setOpen(true)} className="font-medium text-brand-600 hover:text-brand-700">{custom ? "Change" : "Use my location"}</button>
      </p>
    );
  }

  return (
    <section className={`card border-brand-200 p-5 ${compact ? "" : "mt-6"}`} aria-labelledby="loc-h">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">📍</span>
        <div className="min-w-0 flex-1">
          <h2 id="loc-h" className="font-semibold">Where are you?</h2>
          <p className="mt-1 text-sm text-slate-600">
            I find restaurants, stores, homes and flights near you, with prices in your currency. Right now I'm using{" "}
            <strong>{home.city}</strong>. Your location stays in this browser.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={useDevice} disabled={!!busy} className="btn-primary shrink-0">
              {busy === "gps" ? "Finding you…" : "📍 Use my current location"}
            </button>
            <span className="text-center text-xs text-slate-400 sm:text-left">or</span>
            <form onSubmit={useSuburb} className="flex min-w-0 flex-1 gap-2">
              <label htmlFor="loc-suburb" className="sr-only">Suburb, city or postcode</label>
              <input id="loc-suburb" className="input min-w-0" value={text} onChange={(e) => setText(e.target.value)} placeholder="Suburb, city or postcode" />
              <button type="submit" disabled={!!busy || !text.trim()} className="btn-dark shrink-0 px-4">{busy === "suburb" ? "…" : "Set"}</button>
            </form>
          </div>
          {note && <p className="mt-3 text-sm text-amber-700" role="alert">{note}</p>}

          <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="loc-country">Country</label>
              <select
                id="loc-country"
                className="input"
                value={loc.country}
                onChange={(e) => setProfile(withCountry({ ...profile, locationAsked: true }, e.target.value))}
              >
                {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="loc-currency">Currency</label>
              <select
                id="loc-currency"
                className="input"
                value={loc.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value, currencyChosen: true, locationAsked: true })}
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{currencySymbol(c)} {c}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setProfile({ ...profile, locationAsked: true });
              setOpen(false);
            }}
            className="mt-4 text-xs text-slate-500 hover:text-slate-800"
          >
            {custom ? "Done" : "Not now"}
          </button>
        </div>
      </div>
    </section>
  );
}
