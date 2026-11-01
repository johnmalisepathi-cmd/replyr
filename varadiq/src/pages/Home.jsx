import { useState } from "react";
import { go } from "../lib/router.js";
import AICore from "../components/AICore.jsx";
import AIDemo from "../components/AIDemo.jsx";
import PilotForm from "../components/PilotForm.jsx";
import WhyDifferent from "../components/WhyDifferent.jsx";
import RoiCalculator from "../components/RoiCalculator.jsx";
import GoalTypeGrid from "../components/GoalTypeGrid.jsx";
import WorldMap from "../components/WorldMap.jsx";
import { COUNTRY_COUNT, findsFor } from "../lib/geo.js";
import { DEFAULT_PROFILE } from "../lib/store.js";
import { Sparkle } from "../components/ai-ui.jsx";

// The home map shows what the assistant found for the demo goals.
const MAP_ITEMS = findsFor(DEFAULT_PROFILE);

const STEPS = [
  { n: "01", title: "Tell it your goal", body: "Type or speak it in your own words: a holiday, a new phone, a home, lower bills, dinner tonight.", eg: "\"Bali in 6 months, under $4,000\"" },
  { n: "02", title: "It makes the plan", body: "Steps with dates, who does what, and a weekly savings amount so the money is ready in time.", eg: "Save $160/wk · book flights in month 2" },
  { n: "03", title: "It works 24/7", body: "The agent does its steps: watching prices, comparing options, finding cheaper bills, setting reminders.", eg: "Checked 930 fares this month" },
  { n: "04", title: "It keeps you moving", body: "Each morning: today's actions. Each week: a check-in on how you're going and what's next.", eg: "\"Flights down 22%. Book today.\"" },
  { n: "05", title: "Done ✓", body: "Every step ticked off, and the goal moves to your history. Then on to the next one.", eg: "\"🎉 Bali booked, under budget\"" },
];

const DAY = [
  ["7:00am", "Today's actions", "\"Book Bali flights (down 22%). Put $160 in the Bali fund.\""],
  ["11:20am", "Money found", "\"Your insurance renews in 3 weeks. Same cover is $260 cheaper. Switch?\""],
  ["2:45pm", "Step done for you", "\"Shortlisted 3 villas with pools under $1,500. Pick one by Friday.\""],
  ["Sunday", "Weekly check-in", "\"4 of 6 Bali steps done, savings on track. Next: the villa.\""],
];

const PLANS = [
  { name: "Free", price: "$0", tag: "Try it out", features: ["2 goals with a plan", "Bill check once a year", "Weekly check-in"] },
  { name: "Plus", price: "$9.99", tag: "For individuals", highlight: true, features: ["10 goals", "AI plans tailored to you", "Today's actions every morning", "Bill savings watched all year", "Instant alerts and weekly check-ins"] },
  { name: "Family", price: "$19.99", tag: "Up to 5 people", features: ["Unlimited goals", "Shared family goals and funds", "Everything in Plus", "Priority alerts"] },
];

const FAQ = [
  { q: "Is the AI real?", a: "Yes. The goal planner, the daily briefing, the weekly check-ins and the advice are written by a real AI model, live. In early access, the places, prices and listings are examples while we connect live data sources." },
  { q: "Why not just ask ChatGPT or Google?", a: "They answer when you ask, then stop. VaradIQ is an agent: it makes a plan for each goal, keeps working on it after you close the app, tells you what to do each day, and checks in every week until the goal is done." },
  { q: "How does it save me money on bills?", a: "Tell it to cut your bills. It compares your electricity, insurance, phone, internet and subscriptions with what's available, and shows the yearly saving for each switch. You can send the money you save straight into another goal, like your holiday fund. At launch, some providers may pay us a fee when you switch; we'll always show you the cheapest option either way." },
  { q: "Where does the information come from?", a: "At launch: travel, retail, property and restaurant data providers, plus official sources for things like interest rates and grants. Every suggestion links back to where it came from." },
  { q: "Will it book, buy or move my money?", a: "No. It plans, finds, compares and reminds. You always decide, and you book, buy, switch or transfer money yourself. The savings tracker just records what you've put aside." },
  { q: "Is it financial advice?", a: "No. Things like interest-rate updates and repayment estimates are general information to help you ask the right questions. Talk to a licensed adviser or lender before big decisions." },
  { q: "What about my privacy?", a: "Your goals are yours. We use them only to find things for you, never sell them, and you can delete them at any time." },
];

const STATS = [
  ["24/7", "working on your goals"],
  ["1 plan", "for every goal, with dates"],
  ["$990/yr", "typical bills cut (sample)"],
  ["0", "bookings made without you"],
];

function Eyebrow({ children }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ai-cyan">{children}</p>;
}

export default function Home({ hasProfile, setProfile }) {
  const [open, setOpen] = useState(0);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="bg-navy-950 text-slate-300">
      {/* HERO */}
      <section className="grid-bg relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(640px 420px at 78% 30%, rgba(59,130,246,0.28), transparent 60%), radial-gradient(520px 380px at 8% 90%, rgba(139,195,74,0.16), transparent 60%), linear-gradient(180deg, transparent 70%, #070d1a)",
          }}
        />
        <div className="section relative grid items-center gap-10 pb-10 pt-12 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-ai-violet/40 bg-ai-violet/10 px-3 py-1 text-xs font-medium text-violet-200">
              <Sparkle className="h-3.5 w-3.5 text-ai-cyan" /> Your AI goal agent · early access
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ textWrap: "balance" }}>
              Tell it your goal. <span className="ai-text">It works on it 24/7 until it's done.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              A holiday, a new phone, your first home, lower bills? Say it once. VaradIQ makes the plan, does the
              research, finds the money, and tells you exactly what to do each day until it's done.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => scrollTo("try-ai")} className="btn-ai px-6 py-3 text-base">
                <Sparkle /> Try it now
              </button>
              <button onClick={() => scrollTo("pilot")} className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10">
                Get early access
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500">Free to start. No credit card.</p>
            <p className="mt-6 max-w-md border-l-2 border-amber-300/60 pl-3 text-sm text-slate-400">
              <span className="font-semibold text-slate-200">Varad</span> is Sanskrit for "a wish granted".{" "}
              <span className="font-semibold text-slate-200">IQ</span> is the intelligence that makes it happen. When a goal is done, our logo turns gold.
            </p>
          </div>
          <div className="min-w-0">
            <AICore />
          </div>
        </div>

        <div className="section relative pb-14">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map(([n, l]) => (
              <div key={l} className="glass px-4 py-3">
                <dt className="text-xl font-extrabold text-white sm:text-2xl">{n}</dt>
                <dd className="text-xs text-slate-400 sm:text-sm">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* TRY THE AI */}
      <section id="try-ai" className="section scroll-mt-20 py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="min-w-0 lg:sticky lg:top-24">
            <Eyebrow>Try it yourself</Eyebrow>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
              Say your goals. Get a plan for each one.
            </h2>
            <p className="mt-4 text-slate-400">
              Talk the way you would to a friend. The agent splits what you say into goals, works out the budget and timing,
              writes the first steps and finds the best option for each.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-ai-cyan">✓</span> Several goals in one sentence</li>
              <li className="flex gap-2"><span className="text-ai-cyan">✓</span> Tap the microphone to speak (where your browser allows)</li>
              <li className="flex gap-2"><span className="text-ai-cyan">✓</span> Sample places and prices, real AI</li>
            </ul>
          </div>
          <div className="min-w-0">
            <AIDemo setProfile={setProfile} />
          </div>
        </div>
      </section>

      {/* A DAY WITH YOUR ASSISTANT */}
      <section className="section py-16">
        <Eyebrow>Always on</Eyebrow>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          A day with your goal agent
        </h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {DAY.map(([time, title, body], i) => (
            <li key={time} className={`p-5 ${i === 0 ? "ai-panel" : "glass"}`}>
              <p className="font-mono text-xs text-ai-cyan">{time}</p>
              <p className="mt-2 font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm text-slate-400">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* WORLD MAP */}
      <section id="map" className="section scroll-mt-20 py-16">
        <Eyebrow>Your world, watched</Eyebrow>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          From dinner around the corner to a villa in Bali.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          Everything the agent finds is pinned on your map: restaurants near you, homes for sale, stores with the best price, and
          your holiday destination. These {MAP_ITEMS.length} sample finds across {COUNTRY_COUNT} countries are for a Perth couple's
          goals. Zoom in, then tap a pin.
        </p>
        <div className="mt-8">
          <WorldMap items={MAP_ITEMS} colorBy="kind" initialView="Asia-Pacific" onOpen={(op) => go(hasProfile ? "/dashboard" : "/onboarding")} title="Live goal map" />
        </div>
        <p className="mt-3 text-xs text-slate-500">Example data in early access. Live prices, listings and places are coming next.</p>
      </section>

      {/* WHY DIFFERENT */}
      <section id="why" className="section scroll-mt-20 py-16">
        <Eyebrow>Why VaradIQ</Eyebrow>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          "Can't I just ask ChatGPT?" You can. It won't finish the job.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          Chatbots answer, then forget. To-do apps wait for you to do everything. VaradIQ is an agent: it plans each
          goal, does its own steps around the clock, and keeps you moving until it's done.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["It makes the plan", "Steps with dates, who does what, and how much to save each week."],
            ["It does the work", "Watching prices, comparing options and finding cheaper bills, all day, even while you sleep."],
            ["It gets you to done", "Today's actions each morning and a check-in each week, until every step is ticked."],
          ].map(([t, b]) => (
            <div key={t} className="glass p-5">
              <p className="font-semibold text-white">{t}</p>
              <p className="mt-2 text-sm text-slate-400">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <WhyDifferent />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section py-16">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          From a goal to done, in five steps.
        </h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.n} className="glass relative flex flex-col p-5">
              <span className="ai-text text-2xl font-extrabold">{s.n}</span>
              <h3 className="mt-2 font-semibold leading-snug text-white">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-400">{s.body}</p>
              <p className="mt-4 border-t border-white/10 pt-3 text-xs italic text-slate-500">{s.eg}</p>
              {i < STEPS.length - 1 && <span className="absolute -right-3 top-8 hidden text-ai-cyan lg:block" aria-hidden="true">→</span>}
            </li>
          ))}
        </ol>
      </section>

      {/* GOAL TYPES */}
      <section id="goals" className="section scroll-mt-20 py-16">
        <Eyebrow>What it can watch</Eyebrow>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          One agent for the big plans, the small ones, and your bills.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">Tap a goal to see what you can say and what the agent works on.</p>
        <div className="mt-8">
          <GoalTypeGrid />
        </div>
      </section>

      {/* SAVINGS */}
      <section id="worth-it" className="section scroll-mt-20 py-16">
        <Eyebrow>Is it worth $9.99 a month?</Eyebrow>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          It pays for itself, usually in the first month.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          Example: cutting $990 a year off your bills pays for Plus more than 8 times over, before it even books your holiday at
          the right price. Move the sliders to try your own numbers.
        </p>
        <div className="mt-10">
          <RoiCalculator />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section py-16">
        <div className="text-center">
          <Eyebrow>Planned pricing</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Less than a coffee a week.</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">Plans aren't on sale yet. Early-access members get Plus free during testing. AUD, including GST.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`relative flex flex-col p-6 ${p.highlight ? "ai-panel" : "glass"}`}>
              {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>}
              <p className="font-semibold text-white">{p.name}</p>
              <p className="text-sm text-slate-400">{p.tag}</p>
              <p className="mt-4 text-4xl font-extrabold text-white">
                {p.price}
                <span className="text-base font-medium text-slate-400">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-ai-cyan">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollTo("pilot")} className={`mt-6 ${p.highlight ? "btn-ai" : "btn border border-white/20 text-white hover:bg-white/10"}`}>
                Get early access
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="section py-16">
        <Eyebrow>Roadmap</Eyebrow>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Where we are, honestly.</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            ["Now", "Early access", "Real AI understands your goals, writes plans and check-ins. Places, prices and bills are sample data."],
            ["Next", "Live data", "Connect travel, retail, property, energy and insurance data so finds and savings are real."],
            ["Then", "In your pocket", "Today's actions by phone notification, and the weekly check-in by email."],
            ["Later", "Your whole life", "Shared family goals and funds, more countries, and goals for anything you can describe."],
          ].map(([when, t, b], i) => (
            <li key={t} className={`rounded-2xl border p-5 ${i === 0 ? "border-ai-cyan/40 bg-ai-cyan/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${i === 0 ? "text-ai-cyan" : "text-slate-500"}`}>{when}</p>
              <p className="mt-1 font-semibold text-white">{t}</p>
              <p className="mt-2 text-sm text-slate-400">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="section py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">Questions</h2>
        <div className="glass mx-auto mt-10 max-w-3xl divide-y divide-white/10">
          {FAQ.map((f, i) => (
            <div key={f.q}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-white">
                {f.q}
                <span className="text-xl text-ai-cyan">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="px-5 pb-5 text-slate-400">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* EARLY ACCESS */}
      <section id="pilot" className="section scroll-mt-20 pb-4">
        <div className="ai-panel grid gap-10 p-6 sm:p-10 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Get your AI goal agent first.</h2>
            <p className="mt-4 text-slate-300">Join early access and tell us the first goal you'd like it to work on.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li>✓ Plus free during early access</li>
              <li>✓ A founding-member discount when plans launch</li>
              <li>✓ Help decide which goals and countries come next</li>
            </ul>
            <button onClick={() => go(hasProfile ? "/dashboard" : "/onboarding")} className="mt-8 text-sm font-semibold text-ai-cyan hover:text-white">
              Or start free now →
            </button>
          </div>
          <PilotForm />
        </div>
      </section>
    </main>
  );
}
