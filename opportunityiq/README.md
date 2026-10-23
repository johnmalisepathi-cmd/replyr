# OpportunityIQ — website + clickable prototype

AI business opportunity discovery and capability matching. This folder holds
the launch website and a clickable product demo for the **WA steel &
engineering pilot**.

## What's real and what's sample

| Part | Status |
| --- | --- |
| Marketing site (hero, how it works, industries, pricing, roadmap, FAQ) | Real, ready to publish |
| Pilot sign-up form | Real once `VITE_WAITLIST_ENDPOINT` is set |
| Fit scoring (`src/lib/match.js`) | Real rule-based logic, explained per match |
| Opportunities, buyers, tender briefs | **Fictional sample data**, labelled in the UI |
| "Ask OpportunityIQ" search | Keyword + distance filter (no LLM yet) |
| Profile & pipeline storage | Browser only (localStorage) |

## Run it

```bash
cd opportunityiq
npm install
npm run dev      # local
npm run build    # static site in dist/
```

Screens: `#/` home · `#/onboarding` · `#/dashboard` · `#/opportunity/:id` ·
`#/pipeline` · `#/privacy`. Hash routing means `dist/` works on any static
host (GitHub Pages, Netlify, Vercel, Cloudflare Pages) with no rewrites.

## Launch checklist

1. **Collect sign-ups.** Create a free form at formspree.io (or Getform/Basin),
   copy `.env.example` to `.env`, set `VITE_WAITLIST_ENDPOINT`, rebuild. Submit
   a test entry and confirm it arrives.
2. **Contact email.** Set `VITE_CONTACT_EMAIL` (shows in the footer).
3. **Domain.** Buy a domain (e.g. a `.com.au` needs an ABN) and point it at
   your host.
4. **Legal.** Replace the pre-launch privacy summary with a full policy and add
   terms of use before taking payments.
5. **Analytics.** Add a privacy-friendly tracker (Plausible, Umami) to measure
   visits → demo → sign-ups.
6. **Recruit.** Message 20–30 WA fabricators directly; aim for 10 pilot spots.

## Next build steps (after the pilot proves demand)

- Real data connectors for public tender portals (check each site's terms)
- Database + login (e.g. Supabase) for profiles and pipelines
- LLM tender summaries with "Not specified" guardrails + human review
- Email alerts, then Stripe billing for Starter ($49) / Pro ($99)
