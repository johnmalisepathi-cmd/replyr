import { useState } from "react";
import { CONTACT_EMAIL, WAITLIST_ENDPOINT } from "../lib/config.js";
import { AU_REGIONS, INDUSTRIES, INDUSTRY_GROUPS, WORLD_REGIONS } from "../lib/data.js";

// Sends pilot sign-ups to WAITLIST_ENDPOINT as JSON. With no endpoint set,
// it falls back to opening an email to CONTACT_EMAIL so no lead is lost.
export default function PilotForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", industry: "steel", region: "Western Australia", note: "" });
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
          body: JSON.stringify({ ...form, industry: INDUSTRIES[form.industry].label, source: "opportunityiq-website" }),
        });
        setStatus(res.ok ? "done" : "error");
      } catch {
        setStatus("error");
      }
    } else if (CONTACT_EMAIL) {
      const body = Object.entries(form).map(([k, v]) => `${k}: ${v}`).join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("OpportunityIQ pilot request")}&body=${encodeURIComponent(body)}`;
      setStatus("done");
    } else {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="flex flex-col justify-center rounded-2xl bg-white p-8 text-slate-900">
        <p className="text-3xl">🎉</p>
        <p className="mt-3 text-xl font-bold">Thanks, {form.name.split(" ")[0] || "you're in"}!</p>
        <p className="mt-2 text-slate-600">We'll be in touch within two business days to book your profile setup call.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 text-slate-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="pf-name">Your name</label>
          <input id="pf-name" required className="input" value={form.name} onChange={set("name")} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="pf-email">Work email</label>
          <input id="pf-email" required type="email" className="input" value={form.email} onChange={set("email")} autoComplete="email" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="pf-company">Company</label>
        <input id="pf-company" required className="input" value={form.company} onChange={set("company")} autoComplete="organization" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="pf-ind">Industry</label>
          <select id="pf-ind" className="input" value={form.industry} onChange={set("industry")}>
            {INDUSTRY_GROUPS.map((g) => (
              <optgroup key={g} label={g}>
                {Object.entries(INDUSTRIES)
                  .filter(([, i]) => i.group === g)
                  .map(([id, i]) => (
                    <option key={id} value={id}>{i.label}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pf-reg">Region</label>
          <select id="pf-reg" className="input" value={form.region} onChange={set("region")}>
            <optgroup label="Australia">{AU_REGIONS.map((r) => <option key={r}>{r}</option>)}</optgroup>
            <optgroup label="International">
              {WORLD_REGIONS.map((r) => <option key={r}>{r}</option>)}
              <option>Another country</option>
            </optgroup>
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="pf-note">What kind of work do you want more of? <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="pf-note" rows={3} className="input" value={form.note} onChange={set("note")} placeholder="e.g. Laser-cut and folded components, $50k–$250k jobs within 300 km of Perth" />
      </div>
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full py-3 text-base">
        {status === "sending" ? "Sending…" : "Request a pilot spot"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {WAITLIST_ENDPOINT || CONTACT_EMAIL
            ? "Something went wrong. Please try again in a moment."
            : "Sign-ups aren't connected yet (site owner: set VITE_WAITLIST_ENDPOINT, see the README)."}
        </p>
      )}
      <p className="text-xs text-slate-500">We only use your details to contact you about the pilot. No spam, ever.</p>
    </form>
  );
}
