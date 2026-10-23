import { useState } from "react";
import { go } from "../lib/router.js";
import { CONTRACT_BANDS, INDUSTRIES, REGIONS } from "../lib/data.js";
import { DEFAULT_PROFILE } from "../lib/store.js";
import { profileFromText, useAI } from "../lib/ai.js";
import { AIBadge, AIThinking, Sparkle } from "../components/ai-ui.jsx";

const STEPS = ["Business", "Capabilities", "Preferences"];

function Toggle({ on, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
        on ? "border-navy-900 bg-navy-900 text-white" : "border-slate-200 bg-white hover:border-slate-400"
      }`}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${on ? "border-brand-400 bg-brand-500" : "border-slate-300"}`}>
        {on && "✓"}
      </span>
      {children}
    </button>
  );
}

export default function Onboarding({ profile, setProfile }) {
  const [p, setP] = useState(profile || DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const ai = useAI();
  const [desc, setDesc] = useState("");
  const [filling, setFilling] = useState(false);
  const [aiNote, setAiNote] = useState("");

  const fillWithAI = async () => {
    setFilling(true);
    setAiNote("");
    const { profile: filled, usedAI, note } = await profileFromText(desc);
    setP((x) => ({ ...filled, companyName: filled.companyName || x.companyName }));
    setAiNote(note || (usedAI ? "AI filled in your profile. Check each step and adjust anything it missed." : "Filled in from keywords. Check each step."));
    setFilling(false);
    setStep(1);
  };
  const ind = INDUSTRIES[p.industry];
  const update = (patch) => setP((x) => ({ ...x, ...patch }));
  const toggleIn = (key, val) =>
    update({ [key]: p[key].includes(val) ? p[key].filter((v) => v !== val) : [...p[key], val] });

  const changeIndustry = (industry) =>
    update({ industry, capabilities: INDUSTRIES[industry].capabilities.slice(0, 2), certifications: [] });

  const finish = () => {
    setProfile(p);
    go("/dashboard");
  };

  return (
    <main className="section max-w-3xl py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Capability profile</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Tell us what your business can deliver</h1>
      <p className="mt-2 text-slate-600">The more specific you are, the better your matches. It takes about two minutes.</p>

      <ol className="mt-8 flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <button onClick={() => setStep(i)} className="w-full text-left">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-brand-500" : "bg-slate-200"}`} />
              <p className={`mt-2 text-xs font-medium ${i === step ? "text-slate-900" : "text-slate-400"}`}>
                {i + 1}. {s}
              </p>
            </button>
          </li>
        ))}
      </ol>

      <div className="ai-panel mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-semibold text-white">
            <Sparkle className="h-5 w-5 text-ai-cyan" /> Skip the form: describe your business
          </p>
          <AIBadge live={!!ai} />
        </div>
        <label htmlFor="ob-ai" className="sr-only">Describe your business</label>
        <textarea
          id="ob-ai"
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="e.g. Swan Valley Steel, Perth. Laser cutting, press brakes, coded welders, ISO 9001. Jobs up to $250k."
          className="mt-3 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-ai-cyan focus:outline-none focus:ring-2 focus:ring-ai-cyan/30"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={fillWithAI} disabled={filling || !desc.trim()} className="btn-ai">
            <Sparkle /> Fill my profile with AI
          </button>
          {filling && <AIThinking label="Building your profile" />}
        </div>
        {aiNote && !filling && <p className="mt-3 text-xs text-cyan-200">{aiNote}</p>}
      </div>

      <div className="card mt-6 p-6">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="ob-name">Company name</label>
              <input id="ob-name" className="input" placeholder="e.g. Swan Valley Steel" value={p.companyName} onChange={(e) => update({ companyName: e.target.value })} />
            </div>
            <div>
              <p className="label">Industry</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(INDUSTRIES).map(([id, i]) => (
                  <Toggle key={id} on={p.industry === id} onClick={() => changeIndustry(id)}>
                    <span className="flex-1">{i.label}</span>
                    {!i.pilot && <span className="text-[10px] uppercase opacity-60">Preview</span>}
                  </Toggle>
                ))}
              </div>
              {!ind.pilot && (
                <p className="mt-2 text-xs text-amber-700">
                  {ind.label} isn't in the pilot yet, so you'll see very few sample matches. Steel and engineering have the most demo data.
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="ob-region">Service region</label>
                <select id="ob-region" className="input" value={p.region} onChange={(e) => update({ region: e.target.value })}>
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="ob-dist">Max travel distance: {p.maxDistanceKm} km</label>
                <input id="ob-dist" type="range" min={25} max={1500} step={25} value={p.maxDistanceKm} onChange={(e) => update({ maxDistanceKm: Number(e.target.value) })} className="mt-3 w-full accent-emerald-500" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="label">What can you do in-house?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ind.capabilities.map((c) => (
                  <Toggle key={c} on={p.capabilities.includes(c)} onClick={() => toggleIn("capabilities", c)}>{c}</Toggle>
                ))}
              </div>
            </div>
            <div>
              <p className="label">Certifications you hold</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ind.certifications.map((c) => (
                  <Toggle key={c} on={p.certifications.includes(c)} onClick={() => toggleIn("certifications", c)}>{c}</Toggle>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="label">Preferred contract size</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {CONTRACT_BANDS.map((b) => (
                  <Toggle key={b.id} on={p.contractBand === b.id} onClick={() => update({ contractBand: b.id })}>{b.label}</Toggle>
                ))}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="ob-ex">Work you don't want <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="ob-ex" className="input" placeholder="e.g. Site installation over 4 m height, stainless food-grade" value={p.excluded} onChange={(e) => update({ excluded: e.target.value })} />
              <p className="mt-1.5 text-xs text-slate-500">In the full product this filters out matching opportunities. Here it's saved to your profile.</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <button className="btn-ghost" onClick={() => (step ? setStep(step - 1) : go("/"))}>
            ← {step ? "Back" : "Home"}
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-dark" onClick={() => setStep(step + 1)}>Next →</button>
          ) : (
            <button className="btn-primary" onClick={finish} disabled={!p.capabilities.length}>
              Show my matches ✨
            </button>
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">Demo: your profile is saved only in this browser. Nothing is sent to us.</p>
    </main>
  );
}
