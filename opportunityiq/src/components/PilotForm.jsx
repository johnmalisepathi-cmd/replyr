import { useState } from "react";
import { CONTACT_EMAIL, WAITLIST_ENDPOINT } from "../lib/config.js";
import { GOAL_TYPES } from "../lib/goals.js";
import { AU_REGIONS, WORLD_REGIONS } from "../lib/places.js";

// Sends early-access sign-ups to WAITLIST_ENDPOINT as JSON. With no endpoint
// set, it falls back to opening an email to CONTACT_EMAIL so no lead is lost.
export default function PilotForm() {
  const [form, setForm] = useState({ name: "", email: "", region: "Western Australia", firstGoal: "holiday", note: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (WAITLIST_ENDPOINT) {
      setStatus("sending");
      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...form, firstGoal: GOAL_TYPES[form.firstGoal].label, source: "opportunityiq-website" }),
        });
        setStatus(res.ok ? "done" : "error");
      } catch {
        setStatus("error");
      }
    } else if (CONTACT_EMAIL) {
      const body = Object.entries(form).map(([k, v]) => `${k}: ${v}`).join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("OpportunityIQ early access")}&body=${encodeURIComponent(body)}`;
      setStatus("done");
    } else {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="flex flex-col justify-center rounded-2xl bg-white p-8 text-slate-900">
        <p className="text-xl font-bold">You're on the list, {form.name.split(" ")[0] || "friend"}!</p>
        <p className="mt-2 text-slate-600">We'll email you as soon as your personal assistant is ready.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 text-slate-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="pf-name">First name</label>
          <input id="pf-name" required className="input" value={form.name} onChange={set("name")} autoComplete="given-name" />
        </div>
        <div>
          <label className="label" htmlFor="pf-email">Email</label>
          <input id="pf-email" required type="email" className="input" value={form.email} onChange={set("email")} autoComplete="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="pf-reg">Where you live</label>
          <select id="pf-reg" className="input" value={form.region} onChange={set("region")}>
            <optgroup label="Australia">{AU_REGIONS.map((r) => <option key={r}>{r}</option>)}</optgroup>
            <optgroup label="International">
              {WORLD_REGIONS.map((r) => <option key={r}>{r}</option>)}
              <option>Another country</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pf-goal">What should I watch first?</label>
          <select id="pf-goal" className="input" value={form.firstGoal} onChange={set("firstGoal")}>
            {Object.entries(GOAL_TYPES).map(([id, g]) => (
              <option key={id} value={id}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="pf-note">Your wish, in your words <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="pf-note" rows={3} className="input" value={form.note} onChange={set("note")} placeholder="e.g. A Bali holiday next winter under $4,000, and a new phone with a great camera" />
      </div>
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full py-3 text-base">
        {status === "sending" ? "Sending…" : "Get early access"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {WAITLIST_ENDPOINT || CONTACT_EMAIL
            ? "Something went wrong. Please try again in a moment."
            : "Sign-ups aren't connected yet (site owner: set VITE_WAITLIST_ENDPOINT, see the README)."}
        </p>
      )}
      <p className="text-xs text-slate-500">We only use your details to tell you when it's ready. No spam, ever.</p>
    </form>
  );
}
