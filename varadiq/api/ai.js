import Anthropic from "@anthropic-ai/sdk";

// VaradIQ's AI server (a Vercel serverless function at /api/ai).
// The website sends { prompt, format: "text" | "json" } and gets back { text }.
// The API key stays here on the server, in the ANTHROPIC_API_KEY environment
// variable, and is never sent to the browser.

export const config = { maxDuration: 60 };

const client = new Anthropic();
const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
const MAX_PROMPT = 12000; // characters; the app's prompts are well under this

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST" });
  }
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "ai_not_configured" });
  // Only your own website may use this AI (stops other sites spending your credits).
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ error: "Not allowed" });

  const { prompt, format } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ error: "Missing prompt" });
  if (prompt.length > MAX_PROMPT) return res.status(413).json({ error: "Prompt too long" });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "low" }, // quick, everyday answers
      // If the model declines a request, the API retries it on a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system:
        format === "json"
          ? "Reply with only valid JSON that matches what the user asks for. No markdown fences, no commentary."
          : "You are VaradIQ, a warm, practical AI goal agent. Use Australian English.",
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") return res.status(200).json({ text: "", refused: true });
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return res.status(200).json({ text });
  } catch (error) {
    console.error("ai failed:", error?.status ?? "", error?.message ?? error);
    if (error instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "rate_limited" });
    if (error instanceof Anthropic.AuthenticationError) return res.status(500).json({ error: "AI key missing or invalid" });
    if (error instanceof Anthropic.APIError) return res.status(502).json({ error: `upstream_${error.status}` });
    return res.status(500).json({ error: "server_error" });
  }
}
