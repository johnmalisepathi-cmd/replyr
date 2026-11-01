# VaradIQ two-week test

Goal: find out, with real people, whether VaradIQ is worth growing.
Run test 1 (the app as it is) and test 2 (bill savings) at the same time.

---

## Rules for deciding (agreed before starting)

| Result after 14 days | Decision |
| --- | --- |
| 5+ people pay the $5 founding member offer, **or** 20+ people use it weekly without a reminder | 🟢 Keep going, build Step 2 (daily checks + alerts) |
| People use it but nobody pays | 🟡 Adjust: lean into bills and commissions |
| Fewer than 5 people come back after the first try | 🔴 Stop or change direction |

For test 2 (bills): 🟢 if 10+ people send a bill **and** 3+ actually switch.

---

## Day 0: set-up (about 1 hour)

1. **Stripe payment link** ($5/month "Founding member")
   - Stripe → Product catalogue → + Add product
     - Name: `VaradIQ Founding Member`
     - Price: `$5.00` AUD, Recurring, Monthly
   - Then Payment Links → + New → choose that product → Create link
   - Send the link to Claude so it can add a "Become a founding member" button to the site
2. **Anthropic spending cap**: console.anthropic.com → Billing → Auto-reload OFF
3. **Tracking sheet**: a Google Sheet with these columns:
   `Date | Name | Where they came from | Signed up? | Came back? | Paid? | Sent bill? | Switched? | Notes`

---

## Where to share (aim: 30–50 people in week 1)

| Place | How many | Tip |
| --- | --- | --- |
| Friends and family (WhatsApp, text) | 10–15 | Personal message, not a group blast |
| Local Facebook groups (suburb, community, migrant groups) | 2–3 groups | Read the rules first; many allow posts on a set "promo day" |
| Reddit: r/australia, r/AusFinance, r/sydney (or your city), r/SideProject | 2–3 posts | Say clearly that you built it; ask for feedback, not sales |
| LinkedIn | 1 post | Founder-story angle |

Always say you're the founder. Honest posts get better replies, and hidden promotion gets removed.

---

## Ready-to-send messages

### Test 1: friends (WhatsApp/text)

> Hey [name]! I've built an AI app called VaradIQ 🌸 You tell it a goal, like "holiday to Japan under $3,000" or "new iPhone cheapest near me", and it makes a plan, searches the web for real prices, and tells you what to do each day.
>
> Could you try it for 5 minutes and tell me honestly what you think? www.varadiq.com
>
> Even "this is confusing" helps me a lot 🙏

### Test 1: Facebook group / LinkedIn

> I built an AI goal helper and I'm looking for 20 people to try it free 🙏
>
> You type a goal, e.g.:
> • "Family trip to Bali in March under $4,000"
> • "Buy a used car under $15k near Parramatta"
> • "New laptop for uni under $1,500"
>
> VaradIQ makes a step-by-step plan, searches the web for real options with prices and booking links, and shows them on a map.
>
> It's free to try: www.varadiq.com
> I'm the founder, and I'd love honest feedback, good or bad. Comment or DM me 😊

### Test 1: Reddit (r/SideProject or similar)

> **Title:** I built an AI agent that turns a goal into a plan and finds real prices. Looking for honest feedback
>
> Hi all, I'm a solo founder from Australia. VaradIQ takes a goal ("Japan trip under $3k", "cheapest iPhone 16 near me"), makes a dated plan, runs live web searches for real options with links, and shows them on a map. Accounts sync across devices.
>
> What I'd love feedback on:
> 1. Was the first result useful?
> 2. Would you come back to it next week?
> 3. What would make it worth paying for?
>
> www.varadiq.com, free, no card needed.

### Test 2: bill savings (Facebook groups, friends)

> 💡 Free bill check this fortnight
>
> Send me a photo of your **electricity, gas, internet or mobile bill**, and I'll check whether there's a cheaper plan for you, with links to switch.
>
> ⚠️ Please cover your **account number and address** first; I only need the plan name, price and usage.
>
> Email: hello@varadiq.com, or DM me.
> I'm testing VaradIQ, a small AI money-saving tool I'm building. No cost, no catch.

### Follow-up after 3 days (everyone who tried it)

> Hi [name], thanks for trying VaradIQ! Quick question: did you go back to it after the first time? If not, what stopped you? (One line is perfect 🙏)

### Founding member offer (day 7, only to people who came back)

> You're one of the first people using VaradIQ 🌸 I'm offering **founding member** access for **$5/month** (Plus will be $9): daily checks on your goals, alerts when prices drop, and a say in what I build next.
>
> [Stripe link]. Cancel any time. No pressure at all, and your feedback is already a huge help!

---

## Handling bills (test 2)

1. Bill arrives at hello@varadiq.com (it forwards to Gmail).
2. In VaradIQ, add a goal such as "Cheaper electricity plan in [suburb], currently paying $X/quarter on [plan]" and run a live search.
3. Double-check the result on the official free comparison site (Australia: energymadeeasy.gov.au; Victoria: compare.energy.vic.gov.au).
4. Reply with the top 1–2 plans, the yearly saving, and the switch link.
5. Delete the bill photo once you've replied (privacy).
6. Log it in the sheet: sent bill / found saving ($) / switched?

Never promise a saving before checking. Say "I'll check if there's a cheaper plan."

---

## What to look at each evening (5 minutes)

| Where | What it tells you |
| --- | --- |
| Vercel → Analytics | Visitors per day, and where they came from |
| Supabase → Authentication → Users | Who signed up |
| Stripe → Payments | Who paid |
| Gmail (hello@) | Bills received, and replies |
| Anthropic Console → Usage | AI spend so far |

---

## Day 14: decide

Fill in:
- Visitors: ___ Sign-ups: ___ Came back in week 2: ___
- Paid $5: ___
- Bills received: ___ Savings found: $___ Switched: ___
- The most common feedback: ___________

Then match it against the rules at the top.
