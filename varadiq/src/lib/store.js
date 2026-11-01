import { useEffect, useState } from "react";
import { DEMO_CREATED, DEMO_GOALS, DEMO_PROGRESS } from "./goals.js";

// Prototype persistence: the profile (with goals) and plan are kept in this
// browser only. A launched product would store them behind a login.
const KEY = "opportunityiq:personal:v1";

export const DEFAULT_PROFILE = {
  name: "",
  city: "Perth",
  region: "Western Australia",
  goals: DEMO_GOALS.map((g) => ({ ...g, created: DEMO_CREATED[g.id] })),
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAppState() {
  const saved = load();
  const [profile, setProfile] = useState(saved?.profile || null);
  const [pipeline, setPipeline] = useState(saved?.pipeline || {});
  // Per goal: { done: [stepId], saved: number, switched: [findId], steps?: [custom plan] }
  const [progress, setProgress] = useState(saved?.progress || DEMO_PROGRESS);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ profile, pipeline, progress }));
    } catch {
      // Storage blocked (private mode) — the app still works for this visit.
    }
  }, [profile, pipeline, progress]);

  const patch = (goalId, fn) => setProgress((p) => ({ ...p, [goalId]: fn(p[goalId] || {}) }));
  const toggle = (list = [], id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const goalActions = {
    toggleStep: (goalId, stepId) => patch(goalId, (g) => ({ ...g, done: toggle(g.done, stepId) })),
    addSaved: (goalId, amount) => patch(goalId, (g) => ({ ...g, saved: Math.max(0, (g.saved || 0) + amount) })),
    toggleSwitch: (goalId, findId) => patch(goalId, (g) => ({ ...g, switched: toggle(g.switched, findId) })),
    setSteps: (goalId, steps) => patch(goalId, (g) => ({ ...g, steps, done: [] })),
    setLive: (goalId, live) => patch(goalId, (g) => ({ ...g, live })),
    // Moves the bill savings found by one goal into another goal's fund.
    sendSavings: (fromId, toId, amount) =>
      setProgress((p) => ({
        ...p,
        [fromId]: { ...(p[fromId] || {}), sent: ((p[fromId] || {}).sent || 0) + amount },
        [toId]: { ...(p[toId] || {}), saved: ((p[toId] || {}).saved || 0) + amount },
      })),
  };

  const setStage = (id, stage) =>
    setPipeline((p) => {
      const next = { ...p };
      if (stage) next[id] = stage;
      else delete next[id];
      return next;
    });

  const reset = () => {
    setProfile(null);
    setPipeline({});
    setProgress({});
  };

  return { profile, setProfile, pipeline, setStage, progress, goalActions, reset };
}
