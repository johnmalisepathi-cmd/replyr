import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const ALLOWED_MODELS = new Set(["gpt-image-1", "dall-e-3", "dall-e-2"]);
const ALLOWED_SIZES = new Set([
  "1024x1024",
  "1024x1536",
  "1536x1024",
  "1024x1792",
  "1792x1024",
  "512x512",
  "256x256",
]);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, configured: Boolean(OPENAI_API_KEY) });
});

app.post("/api/generate", async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Server is missing OPENAI_API_KEY. Add it to server/.env and restart the server.",
    });
  }

  const { prompt, model = "gpt-image-1", size = "1024x1024", n = 1 } = req.body || {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "A prompt is required." });
  }
  if (!ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: `Unsupported model: ${model}` });
  }
  if (!ALLOWED_SIZES.has(size)) {
    return res.status(400).json({ error: `Unsupported size: ${size}` });
  }

  const maxCount = model === "dall-e-3" ? 1 : 4;
  const count = Math.min(Math.max(parseInt(n, 10) || 1, 1), maxCount);

  const body = {
    model,
    prompt: prompt.trim(),
    size,
    n: count,
  };
  // gpt-image-1 always returns base64 and rejects response_format.
  if (model !== "gpt-image-1") {
    body.response_format = "b64_json";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "Image generation failed." });
    }

    const images = (data.data || [])
      .map((item) => item.b64_json)
      .filter(Boolean)
      .map((b64) => `data:image/png;base64,${b64}`);

    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unexpected error generating images." });
  }
});

app.listen(PORT, () => {
  console.log(`Art generator API listening on http://localhost:${PORT}`);
});
