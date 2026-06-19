import { useRef, useState } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import TemplateGallery from "./components/TemplateGallery";
import { templateToDataUrl } from "./lib/templates";
import { downloadImageAsPdf, downloadImageSizeBundlePdf, printSizes } from "./lib/pdf";

export default function App() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("draw"); // "draw" | "coloring"
  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#ec4899");
  const [brushSize, setBrushSize] = useState(12);
  const [opacity, setOpacity] = useState(1);
  const [activeTemplateId, setActiveTemplateId] = useState("blank");
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [printSize, setPrintSize] = useState("8x10");
  const [bundleSizeIds, setBundleSizeIds] = useState(printSizes.map((s) => s.id));

  function toggleBundleSize(id) {
    setBundleSizeIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function handleDownloadPdf() {
    const dataUrl = canvasRef.current?.getDataUrl();
    if (dataUrl) downloadImageAsPdf(dataUrl, { sizeId: printSize, filename: "artcraft-studio.pdf" });
  }

  function handleDownloadBundlePdf() {
    const dataUrl = canvasRef.current?.getDataUrl();
    if (dataUrl) downloadImageSizeBundlePdf(dataUrl, { sizeIds: bundleSizeIds, filename: "artcraft-studio-bundle.pdf" });
  }

  function handleSelectTemplate(template) {
    canvasRef.current?.loadImage(templateToDataUrl(template.svg));
    setActiveTemplateId(template.id);
    if (template.id !== "blank" && tool !== "fill") {
      setTool("fill");
    }
  }

  function handleClear() {
    if (window.confirm("Clear the canvas? This can't be undone after the history limit is reached.")) {
      canvasRef.current?.clear();
      setActiveTemplateId("blank");
    }
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    if (nextMode === "coloring" && tool !== "fill" && tool !== "brush" && tool !== "eraser") {
      setTool("fill");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gradient sm:text-2xl">ArtCraft Studio</h1>
            <p className="mt-0.5 text-sm text-white/50">Paint freely or colour in a ready-made design</p>
          </div>
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => handleModeChange("draw")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                mode === "draw" ? "bg-fuchsia-500/20 text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Free Draw
            </button>
            <button
              onClick={() => handleModeChange("coloring")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                mode === "coloring" ? "bg-fuchsia-500/20 text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Colouring Book
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 sm:p-6 lg:flex-row">
        <aside className="lg:w-72 lg:shrink-0">
          <Toolbar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            opacity={opacity}
            setOpacity={setOpacity}
            onUndo={() => canvasRef.current?.undo()}
            onRedo={() => canvasRef.current?.redo()}
            onClear={handleClear}
            onDownload={() => canvasRef.current?.download("artcraft-studio.png")}
            onDownloadPdf={handleDownloadPdf}
            printSize={printSize}
            setPrintSize={setPrintSize}
            bundleSizeIds={bundleSizeIds}
            toggleBundleSize={toggleBundleSize}
            onDownloadBundlePdf={handleDownloadBundlePdf}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
          />
        </aside>

        <section className="flex flex-1 flex-col gap-4">
          {mode === "coloring" && (
            <TemplateGallery activeId={activeTemplateId} onSelect={handleSelectTemplate} />
          )}
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-6">
            <Canvas ref={canvasRef} tool={tool} color={color} brushSize={brushSize} opacity={opacity} onHistoryChange={setHistory} />
          </div>
        </section>
      </main>
    </div>
  );
}
