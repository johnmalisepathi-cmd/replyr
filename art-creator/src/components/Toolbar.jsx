const TOOLS = [
  { id: "brush", label: "Brush" },
  { id: "eraser", label: "Eraser" },
  { id: "fill", label: "Fill" },
  { id: "line", label: "Line" },
  { id: "rect", label: "Rectangle" },
  { id: "circle", label: "Circle" },
];

import { printSizes } from "../lib/pdf";

const SWATCHES = [
  "#1f2937",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f472b6",
  "#a16207",
];

export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  brushSize,
  setBrushSize,
  opacity,
  setOpacity,
  onUndo,
  onRedo,
  onClear,
  onDownload,
  onDownloadPdf,
  printSize,
  setPrintSize,
  canUndo,
  canRedo,
}) {
  return (
    <div className="glass flex flex-col gap-5 rounded-2xl p-4">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Tools</h3>
        <div className="grid grid-cols-3 gap-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                tool === t.id
                  ? "border-fuchsia-400/60 bg-fuchsia-500/20 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Colour</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0"
            aria-label="Custom colour"
          />
          <span className="font-mono text-sm text-white/60">{color}</span>
        </div>
        <div className="mt-3 grid grid-cols-8 gap-1.5">
          {SWATCHES.map((swatch) => (
            <button
              key={swatch}
              onClick={() => setColor(swatch)}
              title={swatch}
              className={`h-6 w-6 rounded-full border transition ${
                color.toLowerCase() === swatch ? "border-white ring-2 ring-fuchsia-400" : "border-white/20"
              }`}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          Brush size — {brushSize}px
        </h3>
        <input
          type="range"
          min="1"
          max="60"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full accent-fuchsia-500"
        />
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          Opacity — {Math.round(opacity * 100)}%
        </h3>
        <input
          type="range"
          min="0.05"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="w-full accent-fuchsia-500"
        />
      </section>

      <section className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition enabled:hover:bg-white/10 disabled:opacity-30"
          >
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition enabled:hover:bg-white/10 disabled:opacity-30"
          >
            Redo
          </button>
        </div>
        <button
          onClick={onClear}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          Clear canvas
        </button>
        <button onClick={onDownload} className="btn-accent rounded-lg px-3 py-2.5 text-sm font-semibold">
          Download PNG
        </button>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Print size</h3>
        <select
          value={printSize}
          onChange={(e) => setPrintSize(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white focus:border-fuchsia-400/60 focus:outline-none"
        >
          {printSizes.map((s) => (
            <option key={s.id} value={s.id} className="bg-ink-900">
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={onDownloadPdf}
          className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
        >
          Download print-ready PDF
        </button>
      </section>
    </div>
  );
}
