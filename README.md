# Replyr — AI First Responder (MVP)

An AI "first responder" that replies instantly to every customer enquiry,
qualifies the lead, and notifies the business owner — so no customer is ever
lost to a slow reply.

It does **not** quote prices or close custom jobs. The owner always handles the
money; Replyr catches, answers, qualifies, and routes.

This is a working front-end prototype. Channels (WhatsApp, Email, Instagram,
Facebook) are **simulated** and clearly labelled "Demo". All state lives in
React — there is no backend and no browser storage.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL.

## The loop to try (acceptance check)

1. **Setup** — a sample Mandurah cafe is pre-loaded. Edit hours, services, FAQ,
   and tone, or switch business type. Click **Continue to inbox**.
2. **Inbox** (the hero) — click **⚡ Simulate incoming enquiry**, or type your
   own customer message (e.g. _"Hey are you open Sunday? Do you do
   gluten-free?"_).
3. Watch the AI reply **instantly**, in the chosen tone, **only** from the
   knowledge base — with a "replied in N seconds" stamp.
4. See the enquiry captured as a **qualified lead card** (intent + urgency +
   summary + contact).
5. Try a quote request (_"can you build me a custom steel staircase? how
   much?"_) — the AI **captures and hands off** rather than quoting, and it
   lands in the **Needs you** queue with an owner notification.
6. The **Dashboard** counters update — most prominently _enquiries caught_ vs
   _would've been missed_.

Leads left in the queue past a short demo threshold trigger an owner-chasing
nudge ("⏰ Don't lose this lead").

## Live AI vs Demo AI

- **Demo AI (default):** a rule-based responder runs entirely in the browser so
  the full loop works with zero setup. Shown as "Demo AI" in the top bar.
- **Live AI:** paste an Anthropic API key via the badge in the top-right to call
  Claude (`claude-sonnet-4-20250514`) directly. The key is held in React memory
  only and never stored.

## AI behaviour rules (baked into the prompt)

- Replies only from the business knowledge base; answers hours, location, and
  services confidently.
- Warm and on-brand for the selected tone; concise.
- Captures intent, contact, and urgency as strict JSON.
- Hands off to the owner (flags `needs_owner`) for price quotes, custom jobs,
  complaints, negotiations, or anything outside the knowledge base — never
  inventing facts, prices, availability, or outcomes.
- Quote-based businesses (Trades & Fabrication, Real estate) are **capture +
  hand off only**; transactional ones (Cafe, Restaurant, Salon) may confirm
  simple fixed-detail things like hours.

## Tech

React + Vite + Tailwind. State via `useReducer` (`src/lib/state.js`). AI layer
(real + mock) in `src/lib/ai.js`.

## Out of scope for v1

Real channel integrations, payments/subscriptions, a persistent backend, ad
generation/social posting, and any price quoting or auto-closing of jobs.
