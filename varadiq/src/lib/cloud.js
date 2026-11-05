import { createClient } from "@supabase/supabase-js";

// Accounts and cloud saving, through Supabase. Turned on by two settings:
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (the "anon" key is meant to be
// public; Row Level Security in supabase/schema.sql keeps each person's data
// private). Without them the app keeps everything in this browser, as before.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Remember whether this page load is the return from a sign-in link, before
// Supabase reads (and may remove) the ?code=… from the address.
export const returningFromSignIn = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("code");

export const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true } }) : null;
export const cloudEnabled = !!supabase;
// Google sign-in needs a Google OAuth client set up in Supabase first; until
// then VITE_GOOGLE_SIGNIN stays unset and only the emailed link is offered.
export const googleEnabled = cloudEnabled && import.meta.env.VITE_GOOGLE_SIGNIN === "on";

// Sign-in links come back with ?code=… (PKCE), which doesn't clash with the
// app's #/ page addresses. The app then opens Today.
const redirect = () => `${window.location.origin}/`;

/** Emails a one-tap sign-in link. Resolves {error} (null on success). */
export async function sendMagicLink(email) {
  if (!supabase) return { error: "Accounts aren't set up yet." };
  const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirect() } });
  return { error: error?.message || null };
}

/** Goes to Google to sign in, then comes back to the app. */
export async function signInWithGoogle() {
  if (!supabase) return { error: "Accounts aren't set up yet." };
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirect() } });
  return { error: error?.message || null };
}

export async function signOut() {
  await supabase?.auth.signOut();
}

/** The saved state for a person, or null if they have none yet. */
export async function loadCloud(userId) {
  const { data, error } = await supabase.from("user_state").select("data").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data?.data || null;
}

export async function saveCloud(userId, state) {
  const { error } = await supabase.from("user_state").upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Deletes everything VaradIQ stores for this person. */
export async function deleteCloud(userId) {
  const { error } = await supabase.from("user_state").delete().eq("user_id", userId);
  if (error) throw error;
}

/** The latest automatic (daily watch) check of a goal, or null. */
export async function loadWatch(userId, goalId) {
  const { data, error } = await supabase.from("goal_watch").select("checked_at,checks,items,news").eq("user_id", userId).eq("goal_id", goalId).maybeSingle();
  if (error) throw error;
  return data || null;
}

/** Whether this person has switched alert emails off. */
export async function loadEmailsOff(userId) {
  const { data, error } = await supabase.from("alert_prefs").select("emails_off").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return !!data?.emails_off;
}

export async function setEmailsOff(userId, off) {
  const { error } = await supabase.from("alert_prefs").upsert({ user_id: userId, emails_off: off, updated_at: new Date().toISOString() });
  if (error) throw error;
}
