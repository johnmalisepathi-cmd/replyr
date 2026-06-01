// Sample business + demo enquiry data. Everything here is clearly "Demo".

export const BUSINESS_TYPES = [
  "Cafe",
  "Restaurant",
  "Trades & Fabrication",
  "Real estate",
  "Salon",
  "Other",
];

export const TONES = ["Friendly", "Professional", "Casual"];

export const CHANNELS = ["WhatsApp", "Email", "Instagram DM", "Facebook"];

// A ready-to-go example so the demo works on first load (the Mandurah cafe
// from the acceptance check).
export const SAMPLE_BUSINESS = {
  name: "Estuary Lane Cafe",
  type: "Cafe",
  description:
    "A relaxed waterfront cafe in Mandurah serving specialty coffee, all-day brunch, and house-baked treats.",
  hours:
    "Mon–Fri 6:30am–3pm, Sat–Sun 7am–3pm. Kitchen closes 30 mins before close.",
  location: "12 Mandurah Terrace, Mandurah WA (free parking out back)",
  services:
    "Specialty coffee, all-day breakfast & brunch, fresh-baked pastries, gluten-free and vegan options, dine-in and takeaway.",
  prices: "",
  faq:
    "We have gluten-free bread and several vegan dishes. Dogs welcome on the terrace. We take walk-ins; small group bookings (6+) by request. Free WiFi.",
  tone: "Friendly",
};

export const BLANK_BUSINESS = {
  name: "",
  type: "Cafe",
  description: "",
  hours: "",
  location: "",
  services: "",
  prices: "",
  faq: "",
  tone: "Friendly",
};

// Canned customer messages to fire into the inbox with one click.
export const DEMO_ENQUIRIES = [
  {
    channel: "WhatsApp",
    name: "Sarah",
    text: "Hey! Are you open Sunday? And do you do gluten-free options? 🙏",
  },
  {
    channel: "Instagram DM",
    name: "Jordan",
    text: "Hi, do you take bookings for a group of 8 this Saturday morning?",
  },
  {
    channel: "Email",
    name: "Michael",
    text: "Whereabouts are you located and is there parking nearby?",
  },
  {
    channel: "Facebook",
    name: "Priya",
    text: "Can you build me a custom steel staircase for my place? Roughly how much would that cost?",
  },
  {
    channel: "WhatsApp",
    name: "Dave",
    text: "URGENT — I need catering for 20 people tomorrow morning, can you help??",
  },
  {
    channel: "Email",
    name: "Lena",
    text: "I came in yesterday and my order was completely wrong. Not happy.",
  },
];

// Avatar-ish initials + a deterministic colour per name.
const AVATAR_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

export function avatarFor(name) {
  const clean = (name || "?").trim();
  const initials = clean
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  return { initials: initials || "?", color: AVATAR_COLORS[hash % AVATAR_COLORS.length] };
}
