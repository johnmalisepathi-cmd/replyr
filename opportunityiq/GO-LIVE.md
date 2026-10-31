# Taking VaradIQ live on varadiq.com

About 30–45 minutes, on a computer (easier than a phone). You need: your GitHub login, your GoDaddy login, and a card for the AI credits.

## 1. Get an AI key (10 min)

1. Go to **platform.claude.com**, sign up, and add a payment method.
2. **Set a monthly spend limit** first (e.g. $20). This caps what the website can ever spend.
3. Open **API keys → Create key**, name it `varadiq-website`, and copy it. You'll paste it in step 3.
   - Keep it secret. Never put it in the website code or a `VITE_` setting.

## 2. Sign-up form (5 min)

1. Go to **formspree.io** and sign up with your email.
2. Create a new form called `VaradIQ early access`.
3. Copy the form's address. It looks like `https://formspree.io/f/abcdwxyz`.
   - New sign-ups will arrive in your email inbox.

## 3. Put the website on Vercel (10 min)

1. Go to **vercel.com** and choose **Sign up with GitHub**.
2. Click **Add New → Project**, then **Import** the `replyr` repository.
3. Set **Root Directory** to `opportunityiq`. Vercel detects Vite by itself.
4. Open **Environment Variables** and add these four:

   | Name | Value |
   | --- | --- |
   | `ANTHROPIC_API_KEY` | the key from step 1 |
   | `VITE_AI_ENDPOINT` | `/api/ai` |
   | `VITE_WAITLIST_ENDPOINT` | the Formspree address from step 2 |
   | `VITE_CONTACT_EMAIL` | your email (or `hello@varadiq.com` later) |

5. Click **Deploy**. After about two minutes you get a free address like `varadiq.vercel.app`. Open it and test it:
   - On the home page, type a goal and tap **Make my plan**. The badge should say **Live AI**.
   - Fill in the early-access form. The email should arrive from Formspree.

> Vercel builds from your main branch. If this work is still on the `claude/...` branch, either merge it into `main` first, or set **Settings → Git → Production Branch** to that branch.

## 4. Connect varadiq.com (10 min, then up to a few hours to take effect)

1. In Vercel, open the project → **Settings → Domains** and add `varadiq.com`. Also add `www.varadiq.com` and choose to redirect it to `varadiq.com`.
2. Vercel shows the DNS records to add. **Use the exact values Vercel shows.** They are normally:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

3. In the **GoDaddy** app or website, go to **Domains → varadiq.com → DNS** (sometimes called "Manage DNS"):
   - Edit the existing **A** record named `@` (GoDaddy's "Parked" one) and change its value to Vercel's.
   - Edit or add the **CNAME** named `www` with Vercel's value.
   - Delete any **Forwarding** set on the domain, if there is one.
4. Wait. Vercel turns the domain green when it's ready (often 10–30 minutes, sometimes a few hours) and adds the 🔒 padlock (HTTPS) for free.

## 5. Optional extras

- **Old domain:** in GoDaddy, set `opportinutyiq.com` to **forward** to `https://varadiq.com`, so typos still reach you.
- **Email like hello@varadiq.com:** use a free email-forwarding service (e.g. ImprovMX), or GoDaddy's forwarding if your plan includes it, so mail lands in your Gmail.
- **Cheaper AI:** the server uses Claude Opus 5.5 on low effort. To spend less, add `AI_MODEL` = `claude-haiku-5-5` in Vercel and redeploy. Answers will be a little simpler.

## What's live after this

| Part | Status |
| --- | --- |
| Website, logo, animated mandala, plans, bills, Today page | ✅ live |
| AI (understanding goals, plans, check-ins, advice) | ✅ live, through `api/ai.js` |
| Early-access sign-ups | ✅ to your email via Formspree |
| Prices, places, listings and bills | ⚠️ still sample data, clearly labelled in the site |
| Goals and progress storage | ⚠️ in each visitor's own browser (no accounts yet) |
