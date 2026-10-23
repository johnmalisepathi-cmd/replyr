// Launch settings. Set these before going live — see README "Launch checklist".

// Where pilot sign-ups are POSTed as JSON. Works with Formspree, Getform,
// Basin, a Google Apps Script web app, or your own API. Set it with
// VITE_WAITLIST_ENDPOINT in a .env file (e.g. https://formspree.io/f/xxxx).
export const WAITLIST_ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT || "";

// Shown in the footer and used as the fallback if no endpoint is configured.
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "";

export const COMPANY = {
  name: "OpportunityIQ",
  pilotRegion: "Western Australia",
  pilotIndustries: "steel fabrication and engineering",
};
