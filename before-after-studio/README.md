# Before/After Studio

Upload a "before" photo and an "after" photo, get back a short share-ready
video with a crossfade/wipe transition, before/after labels, and an
optional caption — built for any before/after business: landscaping,
renovation, detailing, cleaning, makeup, construction, manufacturing,
cooking, whatever the customer wants to show off.

This is the self-serve product version of the idea (as opposed to a
"send me your photos and I'll edit them" agency service) — the whole point
is that a business does this themselves, in a couple of minutes, without
needing you at all.

## Why fully client-side (no backend, no upload)

Everything — image handling, the transition animation, and the video
recording — happens in the browser using `<canvas>` +
`canvas.captureStream()` + `MediaRecorder`. Nothing is uploaded anywhere.
That means:

- Zero hosting/infra cost to run (deploys as a static site, same as
  `art-creator` and the root `replyr` app in this repo).
- Customer photos never leave their device — a real selling point,
  especially for anyone hesitant to email/upload photos to a stranger.
- No server-side video processing (FFmpeg, cloud rendering) to pay for or
  maintain at this stage.

Trade-off: output is `.webm`, and canvas recording support is best in
Chrome/Edge — Safari's support is limited. Good enough to validate demand
before investing in a server-side pipeline for broader format support.

## Run it

```bash
cd before-after-studio
npm install
npm run dev
```

## What's next if this validates

- Multiple before/after pairs in one video (a "job gallery" reel).
- More transition styles and branding options (logo watermark, brand
  colors/fonts).
- Optional MP4 export via a small server-side conversion step, once there's
  a paying reason to run one.
- Accounts + saved projects, if/when this becomes a paid subscription
  product rather than a free tool.
