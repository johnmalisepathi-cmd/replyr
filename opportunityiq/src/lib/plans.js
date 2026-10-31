import { daysUntil } from "./match.js";
import { FINDS } from "./goals.js";

// The Goal Agent's plans. Every goal gets steps from now until its date:
// some are done by the agent (watching, comparing, alerting), some are for
// the person (booking, paying, signing). The AI can rewrite a plan; these
// templates are the starting point and the fallback.
//
// at: when the step is due, as a share of the time until the goal (0 = now, 1 = the goal date).

const T = (title, at, who, detail) => ({ title, at, who, detail });

export const PLAN_TEMPLATES = {
  holiday: [
    T("Set up the savings plan", 0, "agent", "Works out a weekly amount so the money is ready before you book."),
    T("Pick dates and the area to stay", 0.12, "you", "The agent suggests the cheapest weeks and the best area for your wishes."),
    T("Book flights at a low price", 0.3, "agent", "Watches fares every day and tells you when to book."),
    T("Book the stay", 0.4, "you", "The agent shortlists 3 places that match, with reasons."),
    T("Travel insurance and documents", 0.75, "you", "Reminds you about passports, visas and insurance in time."),
    T("Final checklist and go", 0.97, "agent", "Weather, packing list and transfers, the week before."),
  ],
  tech: [
    T("Shortlist the best options", 0, "agent", "Compares models against what matters to you."),
    T("Decide on the model", 0.25, "you", "Pick from the agent's top 3."),
    T("Wait for the best price", 0.5, "agent", "Watches stores, sales and cashback, and alerts you."),
    T("Buy it", 0.8, "you", "Buy when the agent says the price is right."),
    T("Trade in or sell the old one", 0.95, "agent", "Finds the best trade-in or resale value."),
  ],
  home: [
    T("Set the deposit savings plan", 0, "agent", "Works out the weekly amount to reach your deposit."),
    T("Check first-home grants and schemes", 0.08, "agent", "Lists what you may be eligible for (check with the official source)."),
    T("Get loan pre-approval", 0.25, "you", "The agent prepares a list of documents lenders usually ask for."),
    T("Shortlist suburbs", 0.35, "agent", "Compares prices, travel times and growth for your wishes."),
    T("Inspect homes", 0.55, "you", "The agent books in new listings that match and keeps notes."),
    T("Make an offer", 0.8, "you", "The agent shows recent sales nearby so you know what's fair."),
    T("Settle and move in", 1, "you", "Reminders for inspections, insurance and settlement day."),
  ],
  dining: [
    T("Find places that match", 0, "agent", "Checks ratings, hours and distance for what you feel like."),
    T("Pick one and book a table", 0.5, "you", "The agent shows the best 3 and when they have tables."),
    T("Enjoy dinner", 1, "you", "Directions and a reminder 30 minutes before."),
  ],
  car: [
    T("Set the savings plan", 0, "agent", "Works out a weekly amount for the car."),
    T("Shortlist models", 0.15, "agent", "Compares running costs, safety and resale."),
    T("Watch listings and prices", 0.4, "agent", "Dealer and private listings, with price history."),
    T("Test drive and inspection", 0.7, "you", "The agent gives you a checklist for the inspection."),
    T("Buy it", 0.9, "you", "The agent checks the price against similar cars."),
  ],
  events: [
    T("Watch for the ticket release", 0, "agent", "Tracks announcements and presale dates."),
    T("Set a reminder for the presale", 0.3, "agent", "Alerts you an hour before tickets open."),
    T("Buy the tickets", 0.5, "you", "Buy from official sellers. The agent warns about risky resale."),
    T("Plan the night", 0.9, "you", "Travel, food nearby and timing."),
  ],
  career: [
    T("Update your CV and profile", 0.05, "you", "The agent suggests what to highlight for the roles you want."),
    T("Watch new listings", 0.1, "agent", "Checks job boards daily for roles that match."),
    T("Apply to the best matches", 0.4, "you", "The agent shortlists and drafts notes for each application."),
    T("Prepare for interviews", 0.7, "you", "Practice questions for each company."),
  ],
  money: [
    T("Check your current bills", 0, "agent", "Compares what you pay with plans available to you."),
    T("Pick the cheaper plans", 0.3, "you", "The agent shows the saving for each switch."),
    T("Switch", 0.6, "you", "Step-by-step help to switch."),
    T("Keep watching for better deals", 1, "agent", "Alerts you if a better plan appears."),
  ],
};

/** How much needs saving for this goal, if anything. */
export function savingsTarget(goal) {
  if (!goal.budget) return 0;
  if (goal.type === "home") return Math.round(goal.budget * 0.1); // a 10% deposit
  if (["dining", "career", "money"].includes(goal.type)) return 0;
  return goal.budget;
}

const DAY = 86_400_000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

/** Yearly bill savings locked in for a "money" goal, and how much was already sent to other goals. */
export function billSavings(goal, prog = {}) {
  const switched = FINDS.filter((f) => f.type === "money" && (prog.switched || []).includes(f.id));
  const perYear = switched.reduce((sum, f) => sum + (f.priceLabel?.startsWith("Save") ? f.value : 0), 0);
  return { perYear, switched, sent: prog.sent || 0, target: goal.budget || 0, share: goal.budget ? Math.min(1, perYear / goal.budget) : 0 };
}

/** The plan's steps with real dates and their done state. */
export function planFor(goal, prog = {}) {
  const start = new Date(goal.created || Date.now()).getTime();
  const end = Math.max(start, new Date(goal.when).getTime());
  const base = prog.steps || PLAN_TEMPLATES[goal.type].map((s, i) => ({ ...s, id: `s${i}` }));
  const done = new Set(prog.done || []);
  return base.map((s) => ({ ...s, due: s.due || iso(start + (end - start) * (s.at ?? 0)), done: done.has(s.id) }));
}

/** Savings status: how far along, and the weekly amount to stay on track. */
export function savingsStatus(goal, prog = {}) {
  const target = savingsTarget(goal);
  if (!target) return null;
  const saved = Math.min(target, prog.saved || 0);
  const start = new Date(goal.created || Date.now()).getTime();
  const end = new Date(goal.when).getTime();
  const total = Math.max(1, end - start);
  const elapsed = Math.min(1, Math.max(0, (Date.now() - start) / total));
  const expected = target * elapsed;
  const weeksLeft = Math.max(1, (end - Date.now()) / (7 * DAY));
  const weekly = Math.max(0, (target - saved) / weeksLeft);
  const gap = expected - saved; // positive = behind
  return { target, saved, weekly, expected, gap, onTrack: gap <= target * 0.03, share: saved / target };
}

/** Overall progress (0-1): steps done, with savings counted as one more step. */
export function goalProgress(goal, prog) {
  const steps = planFor(goal, prog);
  const s = goal.type === "money" ? billSavings(goal, prog) : savingsStatus(goal, prog);
  const parts = steps.length + (s ? 1 : 0);
  const done = steps.filter((x) => x.done).length + (s ? s.share : 0);
  return parts ? done / parts : 0;
}

export const isComplete = (goal, prog) => planFor(goal, prog).every((s) => s.done);

export function dueText(date) {
  const d = daysUntil(date);
  if (d === null) return "";
  if (d < 0) return `${-d} day${d === -1 ? "" : "s"} overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  if (d < 14) return `In ${d} days`;
  if (d < 60) return `In ${Math.round(d / 7)} weeks`;
  return `In ${Math.round(d / 30.4)} months`;
}

/**
 * Today's actions across all goals, most urgent first: the next step of
 * each goal and any savings top-up that's needed.
 */
export function todaysActions(goals, progress, bestFind = () => null) {
  const out = [];
  for (const g of goals) {
    const prog = progress[g.id] || {};
    if (isComplete(g, prog)) continue;
    const next = planFor(g, prog).find((s) => !s.done);
    const find = bestFind(g);
    if (next) {
      const days = daysUntil(next.due);
      out.push({ key: `${g.id}-${next.id}`, goal: g, step: next, kind: "step", urgency: days, text: next.title, hint: next.who === "agent" ? `I'm on it. ${next.detail}` : next.detail, find });
    }
    const s = savingsStatus(g, prog);
    if (s && s.saved < s.target) {
      out.push({ key: `${g.id}-save`, goal: g, kind: "save", urgency: s.onTrack ? 6 : 0, amount: Math.ceil(s.weekly / 10) * 10, text: `Put $${(Math.ceil(s.weekly / 10) * 10).toLocaleString("en-AU")} towards ${g.title}`, hint: s.onTrack ? "This week's amount to stay on track." : `You're about $${Math.round(s.gap).toLocaleString("en-AU")} behind. This gets you back on track.` });
    }
  }
  return out.sort((a, b) => a.urgency - b.urgency);
}

// What the agent has done in the background (shown as its activity log).
const LOG = {
  holiday: (n) => [`Checked fares from your city ${n * 31} times this month`, `Compared ${n * 12} places to stay`, "Set a price alert for your dates"],
  tech: (n) => [`Compared prices at ${n + 4} stores`, "Checked upcoming sales and cashback", "Read reviews for the top 3 models"],
  home: (n) => [`Screened ${n * 23} new listings`, "Checked the latest interest-rate news", "Updated your repayment estimate"],
  dining: (n) => [`Checked ${n * 6} places near you`, "Checked opening hours and ratings"],
  car: (n) => [`Screened ${n * 17} listings`, "Checked price history for each model"],
  events: () => ["Watching ticket announcements", "Checked official sellers"],
  career: (n) => [`Screened ${n * 15} new job ads`, "Checked salary ranges"],
  money: (n) => [`Compared ${n * 9} plans`, "Checked for new rebates"],
};
export const agentLog = (goal, nFinds) => LOG[goal.type](Math.max(1, nFinds));
