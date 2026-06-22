// Style presets — each appends a consistent "style suffix" to the user's
// prompt so a whole collection (e.g. for an Etsy shop) stays visually
// cohesive no matter what the subject is.
export const stylePresets = [
  {
    id: "coloring-page",
    name: "Coloring Book Page",
    description: "Simple cute outline sheet for kids' coloring books",
    swatch: "#cbd5e1",
    suffix:
      "black and white coloring book page for kids, bold clean black outlines only, no color, no shading, no grey, pure white background, simple cute cartoon line art, thick lines, centered single subject",
  },
  {
    id: "mandala",
    name: "Mandala Coloring Page",
    description: "Intricate symmetric line art to colour in",
    swatch: "#94a3b8",
    suffix:
      "intricate black and white mandala line art, symmetric design, clean bold outlines, pure white background, no shading, coloring book page for adults",
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
    id: "watercolor",
    name: "Watercolor",
    description: "Soft brush strokes, gentle color bleeds, pastel",
    swatch: "#93c5fd",
    suffix:
      "soft watercolor painting style, delicate brush strokes, gentle color bleeds, light pastel palette, hand-painted paper texture",
  },
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
    name: "Old Colonial / Vintage",
    description: "Vintage sepia tones, antique parchment, oil painting",
    swatch: "#b45309",
    suffix:
      "old colonial era aesthetic, vintage sepia tones, antique parchment textures, ornate decorative borders, classic oil painting style",
  },
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Epic fantasy nature, misty mountains, painterly",
    swatch: "#16a34a",
    suffix:
      "epic fantasy landscape, lush rolling hills, ancient mossy forests, misty mountains, painterly realism, golden-hour lighting",
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

export function buildPrompt(userPrompt, preset) {
  const trimmed = userPrompt.trim();
  if (!preset || !preset.suffix) return trimmed;
  if (!trimmed) return preset.suffix;
  return `${trimmed}, ${preset.suffix}`;
}
