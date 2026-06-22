import { useMemo, useState } from "react";
import StylePresets from "./components/StylePresets";
import GeneratorForm from "./components/GeneratorForm";
import ResultsGallery from "./components/ResultsGallery";
import { stylePresets, buildPrompt } from "./lib/presets";
import { aspectRatios, buildBatchUrls } from "./lib/pollinations";
import { printSizes } from "./lib/pdf";

export default function App() {
  const [styleId, setStyleId] = useState(stylePresets[0].id);
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("portrait");
  const [count, setCount] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [batches, setBatches] = useState([]);
  const [printSize, setPrintSize] = useState("8x10");
  const [bundleSizeIds, setBundleSizeIds] = useState(printSizes.map((s) => s.id));

  function toggleBundleSize(id) {
    setBundleSizeIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  const selectedPreset = useMemo(() => stylePresets.find((p) => p.id === styleId), [styleId]);
  const finalPrompt = useMemo(() => buildPrompt(prompt, selectedPreset), [prompt, selectedPreset]);

  function handleGenerate() {
    if (!finalPrompt.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const ratio = aspectRatios.find((r) => r.id === aspect) || aspectRatios[0];
      const images = buildBatchUrls(finalPrompt, { width: ratio.width, height: ratio.height, count });
      setBatches((prev) => [
        {
          id: crypto.randomUUID().slice(0, 8),
          styleId: selectedPreset.id,
          styleName: selectedPreset.name,
          prompt: finalPrompt,
          images,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong starting your generation.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-bold text-gradient sm:text-2xl">Imagine</h1>
          <p className="mt-0.5 text-sm text-white/50">
            Free AI art & coloring-page generator — pick a style, describe your idea, download for Etsy. No account, no
            key.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 sm:p-6 lg:flex-row">
        <aside className="flex flex-col gap-4 lg:w-80 lg:shrink-0">
          <StylePresets selectedId={styleId} onSelect={setStyleId} />
          <GeneratorForm
            prompt={prompt}
            setPrompt={setPrompt}
            finalPrompt={finalPrompt}
            aspect={aspect}
            setAspect={setAspect}
            count={count}
            setCount={setCount}
            onGenerate={handleGenerate}
            generating={generating}
            error={error}
          />
        </aside>

        <section className="flex flex-1 flex-col">
          <ResultsGallery
            batches={batches}
            printSize={printSize}
            setPrintSize={setPrintSize}
            bundleSizeIds={bundleSizeIds}
            toggleBundleSize={toggleBundleSize}
          />
        </section>
      </main>
    </div>
  );
}
