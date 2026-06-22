// Style presets — each appends a consistent "style suffix" to the user's
// prompt so a whole collection (e.g. for an Etsy shop) stays visually
// cohesive no matter what the subject is.
export const stylePresets = [
  {
    id: "futuristic",
    name: "Futuristic / Sci-Fi",
    description: "Neon-lit cityscapes, sleek tech, cinematic sci-fi",
    swatch: "#22d3ee",
    suffix:
      "futuristic sci-fi style, sleek neon-lit cityscape, advanced technology, cinematic lighting, highly detailed digital concept art",
  },
  {
    id: "colonial",
    name: "Old Colonial",
    description: "Vintage sepia tones, antique parchment, classic oil painting",
    swatch: "#b45309",
    suffix:
      "old colonial era aesthetic, vintage sepia tones, antique parchment textures, ornate decorative borders, classic oil painting style",
  },
  {
    id: "middle-earth",
    name: "Middle-earth Fantasy",
    description: "Epic fantasy nature, lush hills, misty mountains",
    swatch: "#16a34a",
    suffix:
      "epic fantasy landscape in the style of Middle-earth, lush rolling hills, ancient mossy forests, misty mountains, painterly realism, golden-hour lighting",
  },
  {
    id: "nature",
    name: "Nature & Landscape",
    description: "Vivid, dramatic, photorealistic landscapes",
    swatch: "#65a30d",
    suffix:
      "breathtaking natural landscape, photorealistic, vivid colors, dramatic lighting, high detail, serene atmosphere",
  },
  {
    id: "love-letter",
    name: "Romantic / Love Letter",
    description: "Handwritten letters, wax seals, warm nostalgia",
    swatch: "#f472b6",
    suffix:
      "romantic vintage aesthetic featuring a handwritten love letter, wax seal, feather quill, warm soft lighting, nostalgic mood, photorealistic detail",
  },
  {
    id: "coloring-page",
    name: "Coloring Book Page",
    description: "Simple cute outline sheet for kids' coloring books",
    swatch: "#cbd5e1",
    suffix:
      "simple cute children's coloring book page, bold thick black outlines only, no shading, no color, no greyscale, flat white background, clean minimal line art, friendly rounded shapes, centered single subject",
  },
  {
    id: "mandala",
    name: "Mandala / Coloring Page",
    description: "Black & white line art, perfect for coloring books",
    swatch: "#94a3b8",
    suffix:
      "intricate black and white line art, symmetric mandala design, clean bold outlines on a plain white background, no shading, ideal for a coloring book page",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft brush strokes, gentle color bleeds, pastel",
    swatch: "#93c5fd",
    suffix:
      "soft watercolor painting style, delicate brush strokes, gentle color bleeds, light pastel palette, hand-painted paper texture",
  },
  {
    id: "boho",
    name: "Boho Botanical",
    description: "Pressed flowers, earthy tones, minimalist line art",
    swatch: "#d97706",
    suffix:
      "boho botanical illustration style, pressed flowers and leaves, earthy muted tones, minimalist line work, modern aesthetic",
  },
  {
    id: "custom",
    name: "Custom (no preset)",
    description: "Use your prompt as-is, no extra style applied",
    swatch: "#a78bfa",
    suffix: "",
  },
];

// Size options grouped by model — matches what each OpenAI image model
// actually accepts.
export const sizeOptionsByModel = {
  "gpt-image-1": [
    { value: "1024x1024", label: "Square (1024x1024)" },
    { value: "1024x1536", label: "Portrait (1024x1536)" },
    { value: "1536x1024", label: "Landscape (1536x1024)" },
  ],
  "dall-e-3": [
    { value: "1024x1024", label: "Square (1024x1024)" },
    { value: "1024x1792", label: "Portrait (1024x1792)" },
    { value: "1792x1024", label: "Landscape (1792x1024)" },
  ],
  "dall-e-2": [
    { value: "1024x1024", label: "Square (1024x1024)" },
    { value: "512x512", label: "Square (512x512)" },
    { value: "256x256", label: "Square (256x256)" },
  ],
};

export const modelOptions = [
  { value: "gpt-image-1", label: "GPT Image 1 (recommended)", maxCount: 4 },
  { value: "dall-e-3", label: "DALL-E 3", maxCount: 1 },
  { value: "dall-e-2", label: "DALL-E 2", maxCount: 4 },
];

export function buildPrompt(userPrompt, preset) {
  const trimmed = userPrompt.trim();
  if (!preset || !preset.suffix) return trimmed;
  if (!trimmed) return preset.suffix;
  return `${trimmed}, ${preset.suffix}`;
}
