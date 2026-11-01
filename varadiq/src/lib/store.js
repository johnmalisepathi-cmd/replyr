import { useEffect, useRef, useState } from "react";
import { DEMO_CREATED, DEMO_GOALS, DEMO_PROGRESS } from "./goals.js";
import { cloudEnabled, loadCloud, saveCloud, signOut as cloudSignOut, supabase } from "./cloud.js";

// The profile (with goals), plan progress and saved finds are always kept in
// this browser. When someone is signed in, they are also saved to their
// account, so they appear on every device and the server can watch them.
const KEY = "opportunityiq:personal:v1";

export const DEFAULT_PROFILE = {
  name: "",
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

  // Signed-in person (null when signed out), and how saving to the cloud is going.
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!cloudEnabled); // false until we know whether someone is signed in
  const [sync, setSync] = useState(cloudEnabled ? "idle" : "off"); // off | idle | loading | saving | saved | error
  const loadedFor = useRef(null); // which account's data is loaded, so we never save over it too early

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ profile, pipeline, progress }));
    } catch {
      // Storage blocked (private mode) — the app still works for this visit.
    }
  }, [profile, pipeline, progress]);

  // Follow sign-in and sign-out.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setUser(data.session?.user || null))
      .finally(() => setAuthReady(true));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      // Just came back from a sign-in link or Google: tidy the address and open Today.
      if (event === "SIGNED_IN" && new URLSearchParams(window.location.search).has("code")) {
        window.history.replaceState(null, "", `${window.location.pathname}#/dashboard`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // On sign-in: use the account's saved goals, or move this browser's goals into the account.
  useEffect(() => {
    if (!user || loadedFor.current === user.id) return;
    let live = true;
    setSync("loading");
    loadCloud(user.id)
      .then(async (cloud) => {
        if (!live) return;
        if (cloud?.profile) {
          setProfile(cloud.profile);
          setPipeline(cloud.pipeline || {});
          setProgress(cloud.progress || {});
        } else if (profile) {
          await saveCloud(user.id, { profile, pipeline, progress });
        }
        loadedFor.current = user.id;
        setSync("saved");
      })
      .catch(() => live && setSync("error"));
    return () => {
      live = false;
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save changes to the account, a moment after the last change.
  useEffect(() => {
    if (!user || loadedFor.current !== user.id || !profile) return;
    setSync("saving");
    const t = setTimeout(() => {
      saveCloud(user.id, { profile, pipeline, progress })
        .then(() => setSync("saved"))
        .catch(() => setSync("error"));
    }, 800);
    return () => clearTimeout(t);
  }, [user, profile, pipeline, progress]);

  const patch = (goalId, fn) => setProgress((p) => ({ ...p, [goalId]: fn(p[goalId] || {}) }));
  const toggle = (list = [], id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const goalActions = {
    toggleStep: (goalId, stepId) => patch(goalId, (g) => ({ ...g, done: toggle(g.done, stepId) })),
    addSaved: (goalId, amount) => patch(goalId, (g) => ({ ...g, saved: Math.max(0, (g.saved || 0) + amount) })),
    toggleSwitch: (goalId, findId) => patch(goalId, (g) => ({ ...g, switched: toggle(g.switched, findId) })),
    setSteps: (goalId, steps) => patch(goalId, (g) => ({ ...g, steps, done: [] })),
    setLive: (goalId, live) => patch(goalId, (g) => ({ ...g, live })),
    // pick: the chosen live option (or null to clear). stepIds: plan steps to tick.
    choose: (goalId, pick, stepIds = []) =>
      patch(goalId, (g) => ({ ...g, pick, done: pick ? [...new Set([...(g.done || []), ...stepIds])] : g.done })),
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

  // Signing out also clears this browser's copy, so the next person on a shared device can't see it.
  const signOut = async () => {
    await cloudSignOut();
    loadedFor.current = null;
    reset();
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Storage blocked: nothing to clear.
    }
  };

  return { profile, setProfile, pipeline, setStage, progress, goalActions, reset, user, sync, signOut, authReady };
}
