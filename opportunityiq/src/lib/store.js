import { useEffect, useState } from "react";

// Prototype persistence: the profile and pipeline are kept in this browser
// only. A launched product would store them in a database behind a login.
const KEY = "opportunityiq:v1";

export const DEFAULT_PROFILE = {
  companyName: "",
  industry: "steel",
  region: "Western Australia",
  maxDistanceKm: 300,
  capabilities: ["Laser cutting", "CNC folding", "Welding"],
  certifications: ["ISO 9001"],
  contractBand: "s",
  excluded: "",
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
