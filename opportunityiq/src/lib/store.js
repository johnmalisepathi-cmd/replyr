import { useEffect, useState } from "react";
import { DEMO_GOALS } from "./goals.js";

// Prototype persistence: the profile (with goals) and plan are kept in this
// browser only. A launched product would store them behind a login.
const KEY = "opportunityiq:personal:v1";

export const DEFAULT_PROFILE = {
  name: "",
  city: "Perth",
  region: "Western Australia",
  goals: DEMO_GOALS,
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

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ profile, pipeline }));
    } catch {
      // Storage blocked (private mode) — the app still works for this visit.
    }
  }, [profile, pipeline]);

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
  };

  return { profile, setProfile, pipeline, setStage, reset };
}
