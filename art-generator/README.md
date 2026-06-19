# Dreamcanvas — AI Art Generator

A style-driven AI art generator: pick a style preset (futuristic, old colonial, Middle-earth fantasy,
nature, romantic/love-letter, mandala/colouring page, watercolor, boho botanical, or your own custom
prompt), describe your idea, and generate consistent artwork — ready to download and use for an Etsy
shop or anywhere else.

It's split into two parts:

- **`client/`** — React + Vite + Tailwind frontend (style picker, prompt builder, results gallery).
- **`server/`** — a tiny Express proxy that calls OpenAI's image generation API. The API key stays on
  the server and is never exposed to the browser.

## Setup

1. Get an API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Configure the server:

   ```bash
   cd art-generator/server
   cp .env.example .env
   # edit .env and paste your key into OPENAI_API_KEY=
   ```

3. Install everything (one time):

   ```bash
   cd art-generator
   npm run setup
   ```

## Run it

```bash
cd art-generator
npm run dev
```

This starts the API server (`http://localhost:8787`) and the frontend (`http://localhost:5173`)
together, and opens the app in your default browser automatically. Press `Ctrl+C` to stop both.

## How it works

- Each **style preset** appends a fixed "style suffix" to your prompt, so a whole batch/collection
  stays visually consistent no matter what subject you describe.
- The **final prompt** sent to the model is shown live so you know exactly what's being generated
  (handy if you also want to reuse it elsewhere, e.g. Canva or Midjourney).
- Choose a **model** (GPT Image 1, DALL-E 3, or DALL-E 2), an output **size/aspect ratio**, and how
  many **variations** to generate at once (DALL-E 3 only supports one image per request).
- Generated images appear in a gallery, grouped by generation batch, with a **Download** button on
  each one.

## Build for production

```bash
cd art-generator/client
npm run build
```

Serve the built `client/dist` folder with any static host, and run `server/` (with `OPENAI_API_KEY`
set) somewhere it can reach the internet — then point the frontend's `/api` requests at that server's
URL (e.g. via a reverse proxy).
