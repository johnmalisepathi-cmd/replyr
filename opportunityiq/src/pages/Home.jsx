import { useMemo, useState } from "react";
import { go } from "../lib/router.js";
import { INDUSTRIES, OPPORTUNITIES } from "../lib/data.js";
import { DEFAULT_PROFILE } from "../lib/store.js";
import { scoreOpportunity } from "../lib/match.js";
import { FitBar } from "../components/ui.jsx";
import PilotForm from "../components/PilotForm.jsx";

const STEPS = [
  {
    n: "01",
    title: "Tell us what you can deliver",
    body: "Build a capability profile: machinery, processes, certifications, region and preferred contract size. Not just an email address.",
    eg: "e.g. Laser cutting · CNC folding · Welding · ISO 9001 · Perth + 300 km",
  },
  {
    n: "02",
    title: "We watch the sources",
    body: "Government tender portals, project pipelines, planning approvals and supplier-registration pages are checked regularly, de-duplicated and linked back to the original.",
    eg: "e.g. A new depot tender, or a hospital car park that just got approval",
  },
  {
    n: "03",
    title: "AI reads the documents",
    body: "A 180-page tender becomes a one-page brief: the work packages, materials, required standards, deadline and risks. If the tender doesn't say, we write \"Not specified\".",
    eg: "e.g. Structural steel, balustrades, access platforms, AS/NZS 5131 CC2",
  },
  {
    n: "04",
    title: "You get scored matches, with reasons",
    body: "Every opportunity gets a fit score based on your capabilities, location, size, certifications and timing, plus a plain-English explanation of the gaps.",
    eg: "e.g. 91% fit: strong for cutting and folding, but installation needs review",
  },
  {
    n: "05",
    title: "You decide and take action",
    body: "Save it, draft an enquiry, prepare a submission checklist and track it from interested to won. Nothing is ever sent without your approval.",
    eg: "e.g. Interested → Contacted → Bidding → Won",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    tag: "Get a feel for it",
    features: ["3 opportunity previews / month", "Basic matching", "Tender summary preview"],
  },
  {
    name: "Starter",
    price: "$49",
    tag: "For small workshops",
    features: ["25 matched opportunities / month", "Personalised AI matching", "Weekly email alerts", "Basic tender analysis", "Pipeline tracking"],
  },
  {
    name: "Pro",
    price: "$99",
    tag: "For growing teams",
    highlight: true,
    features: [
      "All matched opportunities",
      "Advanced matching with explanations",
      "Daily alerts",
      "Detailed tender analysis",
      "Bid assistance: enquiry drafts, checklists, capability statements",
    ],
  },
];

const FAQ = [
  {
    q: "Is this live today?",
    a: "Not yet. We're running a pilot with a small group of Western Australian steel and engineering businesses. The demo on this site uses sample data so you can see exactly how it will work.",
  },
  {
    q: "How is this different from a tender alert service?",
    a: "Alert services match keywords. We match your capabilities, read the documents to find the specific work packages you could do, and flag early signals (like planning approvals) before a tender exists. Each match comes with the reasons behind it.",
  },
  {
    q: "Where does the data come from?",
    a: "From public sources like government tender portals, published procurement notices, project pipelines and planning announcements. Private or paywalled sources are only used where we have permission or a licence.",
  },
  {
    q: "Will it contact buyers or submit bids for me?",
    a: "No. OpportunityIQ drafts and organises, but you send. We also can't guarantee you'll win work. Our job is to make sure you see the right opportunities early and spend less time on the wrong ones.",
  },
  {
    q: "What does the pilot cost?",
    a: "Pilot members get free access during the testing period, then a founding-member discount if they choose to subscribe. In return, we ask for honest feedback each fortnight.",
  },
];

function MiniMatchDemo() {
  const caps = INDUSTRIES.steel.capabilities.slice(0, 7);
  const [selected, setSelected] = useState(["Laser cutting", "CNC folding", "Welding"]);
  const toggle = (c) => setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const results = useMemo(() => {
    const profile = { ...DEFAULT_PROFILE, capabilities: selected, certifications: ["ISO 9001", "AS/NZS 5131"] };
    return OPPORTUNITIES.filter((o) => o.industry === "steel")
      .slice(0, 4)
      .map((o) => ({ op: o, ...scoreOpportunity(o, profile) }))
      .sort((a, b) => b.score - a.score);
  }, [selected]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="font-semibold">Try it: what can your workshop do?</p>
          <p className="text-xs text-slate-500">Steel fabrication · Western Australia · sample data</p>
        </div>
        <span className="chip">Live scoring</span>
      </div>
      <div className="flex flex-wrap gap-2 px-5 pt-4">
        {caps.map((c) => {
          const on = selected.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              aria-pressed={on}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                on ? "border-navy-900 bg-navy-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {on ? "✓ " : ""}
              {c}
            </button>
          );
        })}
      </div>
      <ul className="space-y-4 p-5">
        {results.map(({ op, score, reasons, gaps }) => (
          <li key={op.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <p className="truncate text-sm font-medium">{op.title}</p>
              <span className={`shrink-0 text-sm font-bold ${score >= 75 ? "text-brand-600" : "text-slate-700"}`}>{score}% fit</span>
            </div>
            <FitBar score={score} />
            <p className="mt-1.5 text-xs text-slate-500">{gaps[0] || reasons[0]}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home({ hasProfile }) {
  const [open, setOpen] = useState(0);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(700px 400px at 85% 10%, rgba(16,185,129,0.28), transparent 60%), radial-gradient(600px 400px at 0% 100%, rgba(42,65,112,0.8), transparent 60%)",
          }}
        />
        <div className="section relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Pilot open · WA steel & engineering
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Find work that fits what you can <span className="text-brand-400">actually deliver.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              OpportunityIQ is your AI business development manager. It reads tenders, project pipelines and planning
              approvals, then shows you only the opportunities that match your machinery, certifications and capacity,
              and explains why.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => scrollTo("pilot")} className="btn-primary px-6 py-3 text-base">
                Join the free pilot
              </button>
              <button
                onClick={() => go(hasProfile ? "/dashboard" : "/onboarding")}
                className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10"
              >
                Explore the demo →
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-400">No credit card. Limited to the first 10 businesses.</p>
          </div>
          <div className="text-slate-900">
            <MiniMatchDemo />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Hours lost", "Owners spend evenings scrolling tender portals, opening 180-page PDFs just to find out it's not their kind of work."],
            ["Hidden work", "The best subcontract packages are buried inside big projects. A tender called \"transport depot\" never says \"brackets\"."],
            ["Too late", "By the time a tender is public, competitors who heard about the project early are already talking to the head contractor."],
          ].map(([t, b]) => (
            <div key={t} className="card p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{t}</p>
              <p className="mt-2 text-slate-700">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white py-20">
        <div className="section">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">How it works</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">From a public notice to a decision, in five steps.</h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="text-sm font-bold text-brand-600">{s.n}</span>
                <h3 className="mt-2 font-semibold leading-snug">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.body}</p>
                <p className="mt-3 border-t border-slate-200 pt-3 text-xs italic text-slate-500">{s.eg}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* DIFFERENTIATORS */}
      <section className="section py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Built to be trusted</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Honest intelligence, not hype.</h2>
            <ul className="mt-8 space-y-5">
              {[
                ["Tenders and signals are labelled differently", "A formal tender has a deadline you can respond to. An early signal (like a planning approval) only means work may follow. We never blur the two."],
                ["\"Not specified\" beats a guess", "If a document doesn't state a steel grade or a contact, the AI says so instead of inventing one."],
                ["Every match is explained", "You see what matched, what's missing and what to check before you spend time on a bid."],
                ["You stay in control", "We draft emails and checklists. You decide what gets sent."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-4">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm text-brand-700">✓</span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-slate-600">{b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI tender brief · sample</p>
            <p className="mt-1 font-semibold">Transport facility: structural steel & access platforms</p>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              {Object.entries(OPPORTUNITIES[0].extraction).map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-3 py-2.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="col-span-2 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="bg-white py-20">
        <div className="section">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Industries</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Starting focused. Built to grow.</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            The engine is the same for every industry. Each one gets its own vocabulary, sources and matching factors. We
            only open an industry once we can support its data reliably.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(INDUSTRIES).map(([id, ind]) => (
              <div key={id} className={`rounded-2xl border p-5 ${ind.pilot ? "border-brand-300 bg-brand-50/50" : "border-slate-200"}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{ind.label}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ind.pilot ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {ind.pilot ? "Pilot now" : "Coming later"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700">{ind.examples}</p>
                <p className="mt-1 text-xs text-slate-500">Matched on: {ind.factors}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Planned pricing</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Simple monthly plans. Cancel anytime.</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            These plans aren't on sale yet. Pilot members use it free and lock in a founding-member discount. Prices are in
            AUD, excluding GST.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                p.highlight ? "border-navy-900 bg-navy-900 text-white shadow-glow" : "border-slate-200 bg-white"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">Most value</span>
              )}
              <p className="font-semibold">{p.name}</p>
              <p className={`text-sm ${p.highlight ? "text-slate-300" : "text-slate-500"}`}>{p.tag}</p>
              <p className="mt-4 text-4xl font-extrabold">
                {p.price}
                <span className={`text-base font-medium ${p.highlight ? "text-slate-300" : "text-slate-500"}`}>/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollTo("pilot")} className={`mt-6 ${p.highlight ? "btn-primary" : "btn-ghost"}`}>
                Join pilot for free access
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="bg-white py-20">
        <div className="section">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Roadmap</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Where we are, honestly.</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              ["Now", "Pilot", "WA steel & engineering. Verified sources, capability profiles, AI summaries and matching."],
              ["Next", "First paying customers", "5–10 fabricators test the service. We measure whether it saves time and finds work worth bidding on."],
              ["Then", "Automation", "More data connectors, personalised email alerts, subscription billing, pipeline tracking."],
              ["Later", "Multi-industry", "Mining services, construction suppliers, then textiles and international markets."],
            ].map(([when, t, b], i) => (
              <li key={t} className={`rounded-2xl border p-5 ${i === 0 ? "border-brand-400 bg-brand-50" : "border-slate-200"}`}>
                <p className={`text-xs font-bold uppercase tracking-wide ${i === 0 ? "text-brand-600" : "text-slate-400"}`}>{when}</p>
                <p className="mt-1 font-semibold">{t}</p>
                <p className="mt-2 text-sm text-slate-600">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="section py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Questions</h2>
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {FAQ.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"
              >
                {f.q}
                <span className="text-xl text-slate-400">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="px-5 pb-5 text-slate-600">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* PILOT */}
      <section id="pilot" className="section scroll-mt-20">
        <div className="grid gap-10 overflow-hidden rounded-3xl bg-navy-900 p-6 text-white sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Join the WA pilot.</h2>
            <p className="mt-4 text-slate-300">
              We're looking for 10 steel fabrication and engineering businesses in Western Australia to shape the product.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li>✓ Free access during the pilot</li>
              <li>✓ A founding-member discount when plans launch</li>
              <li>✓ Your capability profile set up with us, one-on-one</li>
              <li>✓ A direct line to the team: your feedback decides what we build</li>
            </ul>
          </div>
          <PilotForm />
        </div>
      </section>
    </main>
  );
}
