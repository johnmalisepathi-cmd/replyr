# Content Agent — weekly AI-tools newsletter drafts

Generates one draft newsletter post a week (niche: practical AI tools for
non-technical small business owners) and opens it as a pull request for you
to review. You approve/edit the PR, then paste the post into your
newsletter platform (Substack recommended — free, no setup needed here).

This does **not** auto-publish or spend any money on its own. It writes a
markdown draft and stops.

## One-time setup

1. Get an Anthropic API key: https://console.anthropic.com/
2. In this GitHub repo: **Settings → Secrets and variables → Actions → New
   repository secret**, name it `ANTHROPIC_API_KEY`, paste the key.
3. That's it — the workflow in `.github/workflows/weekly-content-draft.yml`
   runs automatically every Monday, or trigger it manually from the
   **Actions** tab ("Weekly content draft" → **Run workflow**).

## Weekly routine (the only time cost)

1. A PR titled "Weekly content draft ready for review" appears.
2. Open it, read the draft in `content-agent/drafts/`.
3. Fill in the `[TOOL NAME]` / `[AFFILIATE LINK]` placeholders once you've
   picked and signed up for a real affiliate program for the tool covered.
4. Merge the PR, copy the post into Substack (or your platform of choice),
   publish.

Budget this at roughly 10-15 minutes a week.

## Running locally / testing without an API key

```bash
cd content-agent
npm install
npm run generate -- --dry-run   # shows what it would do, no API call
npm run generate                # requires ANTHROPIC_API_KEY in your env
```

## Keeping the topic queue full

`topics.json` has a starter queue of 8 topics. The script picks the next
one that doesn't already have a draft in `drafts/`. Add more entries as the
queue runs low — same `{id, title, angle}` shape.

## Phased spend plan (see full reasoning in chat)

- **Phase 0 (now): $0.** Run this for ~4-6 weeks, publish organically,
  see if anything gets real engagement (opens, clicks, replies).
- **Phase 1 (only if Phase 0 shows a spark): ~$100-200.** Small paid tests
  on whatever channel showed the most organic interest.
- **Phase 2 (only if Phase 1 shows real ROI): remaining budget.** Scale the
  channel that actually worked.

Do not skip to Phase 2. Spend follows evidence, not hope.

## Honest expectations

Most projects like this earn $0-5/day for the first few months. This is a
tool that removes the writing bottleneck, not a guarantee of income — reach
depends on whether the content actually resonates and gets shared/found.
