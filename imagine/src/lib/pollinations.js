// Free, key-less AI image generation via Pollinations.
// An image is produced simply by requesting a URL — no API key, no server,
// no account. We build that URL here.

export const aspectRatios = [
  { id: "portrait", label: "Portrait (good for prints)", width: 896, height: 1152 },
  { id: "square", label: "Square", width: 1024, height: 1024 },
  { id: "landscape", label: "Landscape", width: 1152, height: 896 },
];

// Builds a Pollinations image URL for the given prompt and options.
export function buildImageUrl(prompt, { width, height, seed }) {
  const encoded = encodeURIComponent(prompt);
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: "true",
    model: "flux",
  });
  return `https://image.pollinations.ai/prompt/${encoded}?${params.toString()}`;
}

// Builds `count` image URLs for one generation, each with a different random
// seed so the variations differ.
export function buildBatchUrls(prompt, { width, height, count }) {
  const urls = [];
  for (let i = 0; i < count; i += 1) {
    const seed = Math.floor(Math.random() * 1_000_000_000);
    urls.push(buildImageUrl(prompt, { width, height, seed }));
  }
  return urls;
}
