# OpportunityIQ — your personal AI assistant

Tell it what you want: a holiday in 6 months, a new phone, your first home,
dinner tonight. OpportunityIQ turns your words into goals, watches prices,
listings, interest rates and places 24/7, and tells you the right moment to act.

## What's real and what's sample

| Part | Status |
| --- | --- |
| Website (home, goals, dashboard, goal pages, plan, map) | Real, ready to publish |
| Early-access form | Real once `VITE_WAITLIST_ENDPOINT` is set |
| AI (understanding goals, daily briefing, ask your assistant, goal advice) | Real AI in the claude.ai preview; on your own host it needs `VITE_AI_ENDPOINT`, otherwise a keyword-based assistant answers |
| Fit scores (`src/lib/match.js`) | Real rule-based logic, explained per find |
| Places, prices, listings, rates, grants (`src/lib/goals.js`) | **Fictional sample data**, labelled in the UI |
| Voice input | Uses the browser's speech recognition where available |
| Goals and plan storage | Browser only (localStorage) |

## Run it

```bash
cd opportunityiq
npm install
npm run dev      # local
npm run build    # static site in dist/
```

Screens: `#/` home · `#/onboarding` (my goals) · `#/dashboard` · `#/goal/:id` ·
`#/pipeline` (my plan) · `#/privacy`. Hash routing means `dist/` works on any static
host (GitHub Pages, Netlify, Vercel, Cloudflare Pages) with no rewrites.

## Launch checklist

1. **Collect sign-ups.** Create a free form at formspree.io (or Getform/Basin),
   copy `.env.example` to `.env`, set `VITE_WAITLIST_ENDPOINT`, rebuild. Submit
   a test entry and confirm it arrives.
2. **AI.** Build a small server (e.g. a Cloudflare Worker or Vercel function)
   that holds your Anthropic API key and answers `POST {prompt, format}` with
   `{text}`. Set its URL as `VITE_AI_ENDPOINT`. Never put the API key in the site.
3. **Contact email.** Set `VITE_CONTACT_EMAIL` (shows in the footer).
4. **Domain.** Buy a domain (e.g. a `.com.au` needs an ABN) and point it at
   your host.
5. **Legal.** Replace the pre-launch privacy summary with a full policy and add
   terms of use before taking payments.
6. **Analytics.** Add a privacy-friendly tracker (Plausible, Umami) to measure
   visits → demo → sign-ups.
7. **Recruit.** Share the explainer video and invite 50 friends, family and followers to early access.

## Next build steps (after early access proves demand)

- Live data: travel (flights, hotels), retail prices, property listings,
  restaurant places and reviews, and official interest-rate sources
- Accounts and a database (e.g. Supabase) so goals sync across devices
- Background monitoring with daily briefings by email and phone alerts
- Stripe billing for Plus ($9.99) and Family ($19.99)
