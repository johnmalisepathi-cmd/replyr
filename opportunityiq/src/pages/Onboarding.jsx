import { useState } from "react";
import { go } from "../lib/router.js";
import { GOAL_TYPES } from "../lib/goals.js";
import { AU_REGIONS, WORLD_REGIONS } from "../lib/places.js";
import { DEFAULT_PROFILE } from "../lib/store.js";
import { goalsFromText, useAI } from "../lib/ai.js";
import { daysUntil, formatMoney } from "../lib/match.js";
import { AIBadge, AIThinking, IndustryIcon, Sparkle } from "../components/ai-ui.jsx";
import VoiceButton from "../components/VoiceButton.jsx";

const blankGoal = () => ({ id: `g-${Date.now()}`, type: "holiday", title: "", wish: "", budget: "", when: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10), location: "", prefs: [] });

function whenText(date) {
  const d = daysUntil(date);
  if (d === null) return "";
  if (d <= 0) return "today";
  if (d === 1) return "tomorrow";
  if (d < 60) return `in ${d} days`;
  return `in about ${Math.round(d / 30.4)} months`;
}

export default function Onboarding({ profile, setProfile }) {
  const [p, setP] = useState(profile || { ...DEFAULT_PROFILE, goals: [] });
  const ai = useAI();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState(null);

  const update = (patch) => setP((x) => ({ ...x, ...patch }));
  const listen = async () => {
    setBusy(true);
    setNote("");
    const r = await goalsFromText(text, p.city);
    const goals = r.goals.map((g, i) => ({ ...g, id: `${g.id}-${Date.now()}-${i}` }));
    setP((x) => ({ ...x, name: x.name || r.name, goals: [...x.goals, ...goals] }));
    setNote(r.note || (goals.length ? `Added ${goals.length} goal${goals.length > 1 ? "s" : ""}. Check them below.` : "I couldn't find a goal in that. Try \"a holiday to Bali in 6 months\"."));
    setText("");
    setBusy(false);
  };
  const removeGoal = (id) => update({ goals: p.goals.filter((g) => g.id !== id) });
  const saveDraft = () => {
    const g = { ...draft, budget: draft.budget ? Number(draft.budget) : null, title: draft.title || GOAL_TYPES[draft.type].label, location: draft.location || p.city, prefs: typeof draft.prefs === "string" ? draft.prefs.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean) : draft.prefs };
    update({ goals: [...p.goals.filter((x) => x.id !== g.id), g] });
    setDraft(null);
  };
  const finish = () => {
    setProfile(p);
    go("/dashboard");
  };

  return (
    <main className="section max-w-3xl py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">My goals</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">What would you like me to watch for you?</h1>
      <p className="mt-2 text-slate-600">Say it in your own words. Add as many goals as you like and change them any time.</p>

      <div className="ai-panel mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-semibold text-white">
            <Sparkle className="h-5 w-5 text-ai-cyan" /> Tell me your goals
          </p>
          <AIBadge live={!!ai} />
        </div>
        <label htmlFor="ob-ai" className="sr-only">Your goals</label>
        <div className="relative mt-3">
          <textarea
            id="ob-ai"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. A holiday to Japan next April under $6,000, and a quiet sushi place for Friday night"
            className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 pr-14 text-sm text-white placeholder:text-slate-500 focus:border-ai-cyan focus:outline-none focus:ring-2 focus:ring-ai-cyan/30"
          />
          <VoiceButton className="absolute bottom-3 right-3" onText={(t) => setText((x) => (x ? `${x} ${t}` : t))} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={listen} disabled={busy || !text.trim()} className="btn-ai">
            <Sparkle /> Add these goals
          </button>
          {busy && <AIThinking label="Understanding your goals" />}
        </div>
        {note && !busy && <p className="mt-3 text-xs text-cyan-200">{note}</p>}
      </div>

      <div className="card mt-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ob-name">Your first name <span className="font-normal text-slate-400">(optional)</span></label>
            <input id="ob-name" className="input" value={p.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Sam" />
          </div>
          <div>
            <label className="label" htmlFor="ob-region">Where you live</label>
            <select id="ob-region" className="input" value={p.region} onChange={(e) => update({ region: e.target.value })}>
              <optgroup label="Australia">{AU_REGIONS.map((r) => <option key={r}>{r}</option>)}</optgroup>
              <optgroup label="International">{WORLD_REGIONS.map((r) => <option key={r}>{r}</option>)}</optgroup>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-semibold">Goals I'm watching ({p.goals.length})</h2>
          <button onClick={() => setDraft(blankGoal())} className="text-sm font-medium text-brand-600 hover:text-brand-700">+ Add one by hand</button>
        </div>

        {!p.goals.length && !draft && (
          <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No goals yet. Tell me above, or{" "}
            <button className="font-medium text-brand-600 underline" onClick={() => update({ goals: DEFAULT_PROFILE.goals })}>
              load the example goals
            </button>
            .
          </p>
        )}

        <ul className="mt-3 space-y-3">
          {p.goals.map((g) => (
            <li key={g.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-ai-cyan">
                <IndustryIcon id={g.type} className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{g.title}</p>
                <p className="text-sm text-slate-500">
                  {[GOAL_TYPES[g.type].label, g.budget ? `budget ${formatMoney(g.budget)}` : null, whenText(g.when), g.location].filter(Boolean).join(" · ")}
                </p>
                {g.prefs?.length > 0 && <p className="mt-1 text-xs text-slate-500">Wants: {g.prefs.join(", ")}</p>}
              </div>
              <div className="flex shrink-0 gap-2 text-sm">
                <button onClick={() => setDraft({ ...g, prefs: g.prefs.join(", ") })} className="text-slate-500 hover:text-slate-900">Edit</button>
                <button onClick={() => removeGoal(g.id)} className="text-red-600 hover:text-red-700">Remove</button>
              </div>
            </li>
          ))}
        </ul>

        {draft && (
          <div className="mt-4 space-y-4 rounded-xl border border-brand-300 bg-brand-50/40 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="dg-type">Kind of goal</label>
                <select id="dg-type" className="input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
                  {Object.entries(GOAL_TYPES).map(([id, g]) => <option key={id} value={id}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="dg-title">Name it</label>
                <input id="dg-title" className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={GOAL_TYPES[draft.type].example} />
              </div>
              <div>
                <label className="label" htmlFor="dg-budget">Budget (AUD)</label>
                <input id="dg-budget" type="number" min="0" className="input" value={draft.budget ?? ""} onChange={(e) => setDraft({ ...draft, budget: e.target.value })} placeholder="e.g. 4000" />
              </div>
              <div>
                <label className="label" htmlFor="dg-when">When</label>
                <input id="dg-when" type="date" className="input" value={draft.when} onChange={(e) => setDraft({ ...draft, when: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="dg-loc">Where</label>
                <input id="dg-loc" className="input" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Bali, or Perth CBD" />
              </div>
              <div>
                <label className="label" htmlFor="dg-prefs">What matters (comma separated)</label>
                <input id="dg-prefs" className="input" value={draft.prefs} onChange={(e) => setDraft({ ...draft, prefs: e.target.value })} placeholder="e.g. pool, beach" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveDraft} className="btn-dark">Save goal</button>
              <button onClick={() => setDraft(null)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <button className="btn-ghost" onClick={() => go("/")}>← Home</button>
          <button className="btn-primary" onClick={finish} disabled={!p.goals.length}>
            Start watching ✨
          </button>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">Demo: your goals are saved only in this browser.</p>
    </main>
  );
}
