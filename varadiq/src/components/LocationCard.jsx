import { useState } from "react";
import { homeOf } from "../lib/geo.js";
import { deviceLocation, lookupPlace, placeName } from "../lib/location.js";

// Asks where to measure distances from: the device location (browser
// permission) or a typed suburb/postcode. Until one is set, distances are
// measured from the main city of the person's state.
export default function LocationCard({ profile, setProfile, compact = false }) {
  const home = homeOf(profile);
  const custom = !!profile.home;
  const [open, setOpen] = useState(!custom && !profile.locationAsked);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");

  const save = (h) => {
    setProfile({ ...profile, home: h, locationAsked: true });
    setOpen(false);
    setNote("");
  };

  const useDevice = async () => {
    setBusy("gps");
    setNote("");
    try {
      const pos = await deviceLocation();
      const label = (await placeName(pos)) || "your location";
      save({ ...pos, label, source: "gps" });
    } catch (e) {
      setNote(
        e.code === "denied"
          ? "Location is blocked for this site. Type your suburb or postcode instead, or allow location in your browser settings."
          : "I couldn't get your location just now. Type your suburb or postcode instead."
      );
    }
    setBusy("");
  };

  const useSuburb = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy("suburb");
    setNote("");
    const hit = await lookupPlace(text);
    if (hit) save({ lat: hit.lat, lng: hit.lng, label: hit.label, source: "suburb" });
    else setNote(`I couldn't find "${text}". Try a suburb and postcode, e.g. "Seville Grove 6112".`);
    setBusy("");
  };

  if (!open) {
    return (
      <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 ${compact ? "" : "mt-4"}`}>
        <span aria-hidden="true">📍</span>
        {custom ? <>Distances from <strong className="text-slate-900">{home.city}</strong></> : <>Distances from <strong className="text-slate-900">{home.city}</strong> (your state's main city)</>}
        <button onClick={() => setOpen(true)} className="font-medium text-brand-600 hover:text-brand-700">{custom ? "Change" : "Use my location"}</button>
      </p>
    );
  }

  return (
    <section className={`card border-brand-200 p-5 ${compact ? "" : "mt-6"}`} aria-labelledby="loc-h">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">📍</span>
        <div className="min-w-0 flex-1">
          <h2 id="loc-h" className="font-semibold">Where should I measure "near you" from?</h2>
          <p className="mt-1 text-sm text-slate-600">
            For restaurants, shops and homes, I rank places by distance. Right now I'm using <strong>{home.city}</strong>. Your
            location stays in this browser.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={useDevice} disabled={!!busy} className="btn-primary shrink-0">
              {busy === "gps" ? "Finding you…" : "📍 Use my current location"}
            </button>
            <span className="text-center text-xs text-slate-400 sm:text-left">or</span>
            <form onSubmit={useSuburb} className="flex min-w-0 flex-1 gap-2">
              <label htmlFor="loc-suburb" className="sr-only">Suburb or postcode</label>
              <input id="loc-suburb" className="input min-w-0" value={text} onChange={(e) => setText(e.target.value)} placeholder="Suburb or postcode" />
              <button type="submit" disabled={!!busy || !text.trim()} className="btn-dark shrink-0 px-4">{busy === "suburb" ? "…" : "Set"}</button>
            </form>
          </div>
          {note && <p className="mt-3 text-sm text-amber-700" role="alert">{note}</p>}
          <button
            onClick={() => {
              setProfile({ ...profile, locationAsked: true });
              setOpen(false);
            }}
            className="mt-3 text-xs text-slate-500 hover:text-slate-800"
          >
            {custom ? "Keep current location" : "Not now"}
          </button>
        </div>
      </div>
    </section>
  );
}
