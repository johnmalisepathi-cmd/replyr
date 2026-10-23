import { useState } from "react";
import { go } from "../lib/router.js";
import { INDUSTRIES, OPPORTUNITIES } from "../lib/data.js";
import AICore from "../components/AICore.jsx";
import AIDemo from "../components/AIDemo.jsx";
import PilotForm from "../components/PilotForm.jsx";
import WhyDifferent from "../components/WhyDifferent.jsx";
import RoiCalculator from "../components/RoiCalculator.jsx";
import IndustryGrid from "../components/IndustryGrid.jsx";
import WorldMap from "../components/WorldMap.jsx";
import { COUNTRY_COUNT, opportunitiesFor } from "../lib/geo.js";
import { DEFAULT_PROFILE } from "../lib/store.js";
import { scoreOpportunity } from "../lib/match.js";

// The home map shows how the sample jobs score for a typical Perth workshop.
const MAP_ITEMS = opportunitiesFor(DEFAULT_PROFILE).map((op) => ({ op, ...scoreOpportunity(op, DEFAULT_PROFILE) }));
import { DocScan, Sparkle } from "../components/ai-ui.jsx";

const STEPS = [
  {
    n: "01",
    title: "Tell the AI what you can deliver",
    body: "Describe your business in a sentence. The AI turns it into a capability profile: machinery, processes, certifications, region and contract size.",
    eg: "\"Laser cutting, press brakes, ISO 9001, Perth\" → 6 capabilities detected",
  },
  {
    n: "02",
    title: "It watches the sources 24/7",
    body: "Tender portals, project pipelines, planning approvals and supplier pages are checked regularly, de-duplicated and linked back to the original.",
    eg: "A new depot tender, or a car park that just got approval",
  },
  {
    n: "03",
    title: "It reads every document",
    body: "A 180-page tender becomes a one-page brief: work packages, materials, standards, deadline and risks. If it isn't stated, the AI writes \"Not specified\".",
    eg: "Structural steel, balustrades, AS/NZS 5131 CC2",
  },
  {
    n: "04",
    title: "It scores and explains each match",
    body: "Every opportunity gets a fit score from your capabilities, location, size, certifications and timing, plus the reasons and the gaps.",
    eg: "91% fit: strong for cutting and folding, check installation",
  },
  {
    n: "05",
    title: "You decide. It does the paperwork",
    body: "The AI drafts the enquiry email, builds the submission checklist and tracks the deadline. Nothing is sent without your approval.",
    eg: "Interested → Contacted → Bidding → Won",
  },
];

const PLANS = [
  { name: "Free", price: "$0", tag: "Get a feel for it", features: ["3 AI opportunity previews / month", "Basic AI matching", "Tender summary preview"] },
  {
    name: "Starter",
    price: "$49",
    tag: "For small workshops",
    features: ["25 AI-matched opportunities / month", "Personalised AI matching", "Weekly AI alerts", "AI tender summaries", "Pipeline tracking"],
  },
  {
    name: "Pro",
    price: "$99",
    tag: "For growing teams",
    highlight: true,
    features: ["Every AI-matched opportunity", "Advanced matching with explanations", "Daily AI alerts", "Detailed AI tender analysis", "AI bid assistant: emails, checklists, capability statements"],
  },
];

const FAQ = [
  {
    q: "Why not just use ChatGPT or Claude?",
    a: "They're great at reading a document you already have. But they only work when you ask, they don't watch tender portals and planning approvals every day, they forget your business between chats, and they can invent a deadline. OpportunityIQ does the finding, checking and tracking for you, and uses AI to explain each match.",
  },
  {
    q: "Is the AI real?",
    a: "Yes. In this preview, the \"Describe your business\" box, the dashboard assistant and the tender analysis are answered by a real AI model, live. The opportunities it reasons about are sample data until the pilot connects real sources.",
  },
  {
    q: "Is this live today?",
    a: "We're running a pilot with a small group of Western Australian steel and engineering businesses. The demo on this site uses sample opportunities so you can see exactly how it will work.",
  },
  {
    q: "How is this different from a tender alert service?",
    a: "Alert services match keywords. Our AI matches your capabilities, reads the documents to find the specific work packages you could do, and flags early signals (like planning approvals) before a tender exists. Every match comes with its reasons.",
  },
  {
    q: "Where does the data come from?",
    a: "From public sources like government tender portals, procurement notices, project pipelines and planning announcements. Private or paywalled sources are only used with permission or a licence.",
  },
  {
    q: "Will the AI contact buyers or submit bids for me?",
    a: "No. It drafts and organises, and you send. We also can't guarantee you'll win work. Our job is to make sure you see the right opportunities early and spend less time on the wrong ones.",
  },
];

const STATS = [
  ["180 pages", "read in seconds"],
  [`${Object.keys(INDUSTRIES).length} industries`, "one AI engine"],
  ["24/7", "source monitoring"],
  ["0", "bids sent without you"],
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
              "radial-gradient(640px 420px at 78% 30%, rgba(124,58,237,0.28), transparent 60%), radial-gradient(520px 380px at 8% 90%, rgba(8,145,178,0.22), transparent 60%), linear-gradient(180deg, transparent 70%, #070d1a)",
          }}
        />
        <div className="section relative grid items-center gap-10 pb-10 pt-12 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-ai-violet/40 bg-ai-violet/10 px-3 py-1 text-xs font-medium text-violet-200">
              <Sparkle className="h-3.5 w-3.5 text-ai-cyan" /> AI pilot open in WA · 31 industries on the way
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ textWrap: "balance" }}>
              Your AI business development manager. <span className="ai-text">Finding work 24/7.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              OpportunityIQ's AI reads tenders, project pipelines and planning approvals, then shows you only the work that
              matches your machinery, certifications and capacity, and explains why.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => scrollTo("try-ai")} className="btn-ai px-6 py-3 text-base">
                <Sparkle /> Try the AI now
              </button>
              <button onClick={() => scrollTo("pilot")} className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10">
                Join the free pilot
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500">No credit card. Limited to the first 10 businesses.</p>
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
              One sentence in. Matched opportunities out.
            </h2>
            <p className="mt-4 text-slate-400">
              Type what your business does, the way you'd tell a new customer. The AI builds your capability profile, scores
              every opportunity, and writes you a briefing.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li className="flex gap-2"><span className="text-ai-cyan">✓</span> Understands trade language: "press brake", "CC2", "hi-vis"</li>
              <li className="flex gap-2"><span className="text-ai-cyan">✓</span> Explains every score in plain English</li>
              <li className="flex gap-2"><span className="text-ai-cyan">✓</span> Sample opportunities, real AI</li>
            </ul>
          </div>
          <div className="min-w-0">
            <AIDemo setProfile={setProfile} />
          </div>
        </div>
      </section>

      {/* WORLD MAP */}
      <section id="map" className="section scroll-mt-20 py-16">
        <Eyebrow>Opportunities everywhere</Eyebrow>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          Your next contract might be down the road, or across the world.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          The AI scans sources city by city and pins every opportunity it finds. Here are{" "}
          {MAP_ITEMS.length} sample jobs in {COUNTRY_COUNT} countries, across many industries. Zoom in, then tap a pin. Once you sign up, the pins are coloured by how well each job fits your business.
        </p>
        <div className="mt-8">
          <WorldMap items={MAP_ITEMS} colorBy="kind" onOpen={(op) => go(hasProfile ? `/opportunity/${op.id}` : "/onboarding")} title="Live opportunity map" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Sample data. The pilot starts in Western Australia; other states and countries open as we connect their tender sources.
        </p>
      </section>

      {/* WHY DIFFERENT */}
      <section id="why" className="section scroll-mt-20 py-16">
        <Eyebrow>Why OpportunityIQ</Eyebrow>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          "Can't I just ask ChatGPT?" You can. Here's what it won't do.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          Chatbots answer questions. They don't go looking. Free portals list tenders. They don't know your business. OpportunityIQ
          does both, every day, and only interrupts you when a job fits.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["It finds work, so you don't have to search", "Every source checked daily. New matches arrive in your inbox before you've had coffee."],
            ["It knows your workshop", "Your machines, certifications, distance and job size are scored against every opportunity."],
            ["It sees work before it's a tender", "Planning approvals and budget announcements flagged months early, so you can call the builder first."],
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

      {/* PROBLEM */}
      <section className="section py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Hours lost", "Owners spend evenings scrolling tender portals, opening 180-page PDFs just to find out it's not their kind of work."],
            ["Hidden work", "The best subcontract packages are buried inside big projects. A tender called \"transport depot\" never says \"brackets\"."],
            ["Too late", "By the time a tender is public, competitors who heard about the project early are already talking to the head contractor."],
          ].map(([t, b]) => (
            <div key={t} className="glass p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">{t}</p>
              <p className="mt-2 text-slate-300">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI READS DOCUMENTS */}
      <section className="section py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <Eyebrow>AI document reading</Eyebrow>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
              180 pages in. One clear brief out.
            </h2>
            <p className="mt-4 text-slate-400">
              A normal tender service shows a title, a budget and a closing date. Our AI reads the whole document and pulls out
              the work you could actually do.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                ["Tenders and signals are labelled differently", "A formal tender has a deadline. An early signal (like a planning approval) only means work may follow."],
                ["\"Not specified\" beats a guess", "If a document doesn't state a steel grade or a contact, the AI says so instead of inventing one."],
                ["You stay in control", "The AI drafts emails and checklists. You decide what gets sent."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ai-cyan/15 text-sm text-ai-cyan">✓</span>
                  <div>
                    <p className="font-semibold text-white">{t}</p>
                    <p className="text-sm text-slate-400">{b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="ai-panel min-w-0 p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">Transport facility: structural steel</p>
              <span className="flex items-center gap-1.5 text-xs text-ai-cyan"><span className="h-1.5 w-1.5 animate-glow rounded-full bg-ai-cyan" /> Extracting</span>
            </div>
            <DocScan fields={OPPORTUNITIES[0].extraction} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section py-16">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          From a public notice to a decision, in five steps.
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

      {/* INDUSTRIES */}
      <section id="industries" className="section scroll-mt-20 py-16">
        <Eyebrow>Industries</Eyebrow>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          One AI engine. {Object.keys(INDUSTRIES).length} industries. Each in its own language.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          From steel and solar to cleaning, IT, catering and healthcare. The AI learns each trade's capabilities, certifications and
          sources. The pilot starts with WA steel and engineering, and other industries open as we connect their data.
        </p>
        <div className="mt-8">
          <IndustryGrid />
        </div>
      </section>

      {/* ROI */}
      <section id="worth-it" className="section scroll-mt-20 py-16">
        <Eyebrow>Is it worth $99 a month?</Eyebrow>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ textWrap: "balance" }}>
          One extra job pays for years of OpportunityIQ.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          Example: a $60,000 job at a 15% margin is $9,000 profit. That covers the Pro plan for more than seven years. Move the
          sliders to try your own numbers.
        </p>
        <div className="mt-10">
          <RoiCalculator />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section py-16">
        <div className="text-center">
          <Eyebrow>Planned pricing</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">An AI BD manager for less than a day's wages.</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Plans aren't on sale yet. Pilot members use it free and lock in a founding-member discount. AUD, excluding GST.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`relative flex flex-col p-6 ${p.highlight ? "ai-panel" : "glass"}`}>
              {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">Most value</span>}
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
                Join pilot for free access
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
            ["Now", "Pilot", "WA steel & engineering. Verified sources, AI capability profiles, AI summaries and matching."],
            ["Next", "First paying customers", "5–10 fabricators test the service. We measure whether it saves time and finds work worth bidding on."],
            ["Then", "Automation", "More data connectors, personalised AI alerts, subscription billing, pipeline tracking."],
            ["Later", "Multi-industry", "Mining services, construction suppliers, then textiles and international markets."],
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

      {/* PILOT */}
      <section id="pilot" className="section scroll-mt-20 pb-4">
        <div className="ai-panel grid gap-10 p-6 sm:p-10 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Join the WA AI pilot.</h2>
            <p className="mt-4 text-slate-300">We're looking for 10 steel fabrication and engineering businesses in Western Australia to shape the product.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li>✓ Free access during the pilot</li>
              <li>✓ A founding-member discount when plans launch</li>
              <li>✓ Your AI capability profile set up with us, one-on-one</li>
              <li>✓ A direct line to the team: your feedback decides what we build</li>
            </ul>
            <button onClick={() => go(hasProfile ? "/dashboard" : "/onboarding")} className="mt-8 text-sm font-semibold text-ai-cyan hover:text-white">
              Or explore the full demo first →
            </button>
          </div>
          <PilotForm />
        </div>
      </section>
    </main>
  );
}
