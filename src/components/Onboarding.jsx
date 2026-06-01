import { Field, TextInput, TextArea, Select } from "./ui.jsx";
import { BUSINESS_TYPES, TONES, SAMPLE_BUSINESS, BLANK_BUSINESS } from "../lib/presets.js";
import { isQuoteBased } from "../lib/ai.js";

export default function Onboarding({ business, onChange, onReset, onContinue, onboarded }) {
  const set = (patch) => onChange(patch);
  const quoteBased = isQuoteBased(business.type);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Set up your <span className="text-gradient">business</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          This is the knowledge base your AI answers from. The more you add, the more it can
          confidently handle — anything it doesn't know gets routed to you.
        </p>
      </div>

      <div className="glass space-y-6 rounded-2xl p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name">
            <TextInput
              value={business.name}
              placeholder="e.g. Estuary Lane Cafe"
              onChange={(e) => set({ name: e.target.value })}
            />
          </Field>
          <Field label="Business type">
            <Select value={business.type} onChange={(e) => set({ type: e.target.value })}>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Short description">
          <TextArea
            rows={2}
            value={business.description}
            placeholder="One or two lines about what you do."
            onChange={(e) => set({ description: e.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Opening hours">
            <TextArea
              rows={2}
              value={business.hours}
              placeholder="Mon–Fri 9–5, Sat 10–2…"
              onChange={(e) => set({ hours: e.target.value })}
            />
          </Field>
          <Field label="Location">
            <TextArea
              rows={2}
              value={business.location}
              placeholder="Address, parking notes…"
              onChange={(e) => set({ location: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Services / products">
          <TextArea
            rows={2}
            value={business.services}
            placeholder="What you offer."
            onChange={(e) => set({ services: e.target.value })}
          />
        </Field>

        <Field
          label="Prices"
          hint={quoteBased ? "Quote-based — AI never prices, it hands off" : "optional"}
        >
          <TextArea
            rows={2}
            value={business.prices}
            disabled={quoteBased}
            placeholder={
              quoteBased
                ? "Quote-based business — the AI captures the request and hands it to you, it never quotes."
                : "Only fixed, public prices. Leave blank if you'd rather quote yourself."
            }
            onChange={(e) => set({ prices: e.target.value })}
            className={quoteBased ? "cursor-not-allowed opacity-50" : ""}
          />
        </Field>

        <Field label="FAQ / things to know">
          <TextArea
            rows={3}
            value={business.faq}
            placeholder="Anything customers often ask — dietary options, policies, parking, etc."
            onChange={(e) => set({ faq: e.target.value })}
          />
        </Field>

        <Field label="Tone of voice">
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => set({ tone: t })}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  business.tone === t
                    ? "border-violet-400/40 bg-violet-500/15 text-violet-200 shadow-glow-sm"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={onContinue} className="btn-accent px-5 py-2.5 text-sm font-semibold">
          {onboarded ? "Save & go to inbox" : "Continue to inbox →"}
        </button>
        <button
          onClick={() => onReset(SAMPLE_BUSINESS)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
        >
          Load sample cafe
        </button>
        <button
          onClick={() => onReset(BLANK_BUSINESS)}
          className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-300"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
