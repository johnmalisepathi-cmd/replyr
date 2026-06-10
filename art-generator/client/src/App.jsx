import { useEffect, useMemo, useState } from "react";
import StylePresets from "./components/StylePresets";
import GeneratorForm from "./components/GeneratorForm";
import ResultsGallery from "./components/ResultsGallery";
import { stylePresets, buildPrompt } from "./lib/presets";
import { generateImages, checkHealth } from "./lib/api";

export default function App() {
  const [styleId, setStyleId] = useState(stylePresets[0].id);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-image-1");
  const [size, setSize] = useState("1024x1024");
  const [count, setCount] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [batches, setBatches] = useState([]);
  const [apiConfigured, setApiConfigured] = useState(null);

  useEffect(() => {
    checkHealth().then((health) => setApiConfigured(Boolean(health.configured)));
  }, []);

  const selectedPreset = useMemo(() => stylePresets.find((p) => p.id === styleId), [styleId]);
  const finalPrompt = useMemo(() => buildPrompt(prompt, selectedPreset), [prompt, selectedPreset]);

  async function handleGenerate() {
    if (!finalPrompt.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const images = await generateImages({ prompt: finalPrompt, model, size, count });
      setBatches((prev) => [
        {
          id: crypto.randomUUID(),
          styleId: selectedPreset.id,
          styleName: selectedPreset.name,
          prompt: finalPrompt,
          images,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong generating your artwork.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-bold text-gradient sm:text-2xl">Dreamcanvas</h1>
          <p className="mt-0.5 text-sm text-white/50">
            Pick a style, describe your idea, and generate consistent AI artwork — ready to download for Etsy.
          </p>
          {apiConfigured === false && (
            <p className="mt-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              The image API isn't configured yet. Copy <code>server/.env.example</code> to{" "}
              <code>server/.env</code>, add your <code>OPENAI_API_KEY</code>, and restart the server.
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 sm:p-6 lg:flex-row">
        <aside className="flex flex-col gap-4 lg:w-80 lg:shrink-0">
          <StylePresets selectedId={styleId} onSelect={setStyleId} />
          <GeneratorForm
            prompt={prompt}
            setPrompt={setPrompt}
            finalPrompt={finalPrompt}
            model={model}
            setModel={setModel}
            size={size}
            setSize={setSize}
            count={count}
            setCount={setCount}
            onGenerate={handleGenerate}
            generating={generating}
            error={error}
          />
        </aside>

        <section className="flex flex-1 flex-col">
          <ResultsGallery batches={batches} />
        </section>
      </main>
    </div>
  );
}
