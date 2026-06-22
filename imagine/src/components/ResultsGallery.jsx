import { useState } from "react";
import { printSizes, downloadImageAsPdf, downloadImageSizeBundlePdf, downloadPng } from "../lib/pdf";

function ImageCard({ src, baseName, printSize, bundleSizeIds }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState("");

  async function run(kind, fn) {
    setBusy(kind);
    try {
      await fn();
    } catch {
      alert("Couldn't prepare that download — please try again in a moment.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/30">
      {!loaded && !failed && (
        <div className="flex aspect-square w-full items-center justify-center">
          <span className="animate-pulse text-xs text-white/40">Generating…</span>
        </div>
      )}
      {failed && (
        <div className="flex aspect-square w-full items-center justify-center p-4 text-center">
          <span className="text-xs text-red-200/70">Image failed to load. Try generating again.</span>
        </div>
      )}
      <img
        src={src}
        crossOrigin="anonymous"
        alt={baseName}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`w-full bg-white object-contain ${loaded ? "block" : "hidden"}`}
      />

      {loaded && (
        <div className="absolute bottom-2 right-2 flex flex-wrap justify-end gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button
            onClick={() => run("png", () => downloadPng(src, `${baseName}.png`))}
            disabled={busy}
            className="rounded-lg bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur disabled:opacity-40"
          >
            {busy === "png" ? "…" : "PNG"}
          </button>
          <button
            onClick={() => run("pdf", () => downloadImageAsPdf(src, { sizeId: printSize, filename: `${baseName}.pdf` }))}
            disabled={busy}
            className="rounded-lg bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur disabled:opacity-40"
          >
            {busy === "pdf" ? "…" : "PDF"}
          </button>
          <button
            onClick={() =>
              run("bundle", () =>
                downloadImageSizeBundlePdf(src, { sizeIds: bundleSizeIds, filename: `${baseName}-bundle.pdf` })
              )
            }
            disabled={busy || bundleSizeIds.length === 0}
            className="rounded-lg bg-cyan-600/80 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur disabled:opacity-30"
          >
            {busy === "bundle" ? "…" : "Bundle"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ResultsGallery({ batches, printSize, setPrintSize, bundleSizeIds, toggleBundleSize }) {
  if (batches.length === 0) {
    return (
      <div className="glass flex flex-1 flex-col items-center justify-center rounded-2xl p-10 text-center">
        <p className="text-lg font-medium text-white/70">Your generated artwork will appear here</p>
        <p className="mt-2 max-w-md text-sm text-white/40">
          Pick a style, describe your idea, and hit "Generate artwork". Each image can be downloaded as a PNG, a
          print-ready PDF, or a multi-size bundle PDF for Etsy.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass flex flex-col gap-3 rounded-2xl p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Single PDF print size</span>
          <select
            value={printSize}
            onChange={(e) => setPrintSize(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white focus:border-cyan-400/60 focus:outline-none"
          >
            {printSizes.map((s) => (
              <option key={s.id} value={s.id} className="bg-ink-900">
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Bundle sizes</span>
          {printSizes.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleBundleSize(s.id)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                bundleSizeIds.includes(s.id)
                  ? "border-cyan-400/60 bg-cyan-500/15 text-white"
                  : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {batches.map((batch) => (
        <div key={batch.id} className="glass rounded-2xl p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-white/70">
              <span className="font-semibold text-white">{batch.styleName}</span> — {batch.prompt}
            </p>
            <span className="text-xs text-white/40">{new Date(batch.createdAt).toLocaleTimeString()}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {batch.images.map((src, idx) => (
              <ImageCard
                key={idx}
                src={src}
                baseName={`${batch.styleId}-${batch.id}-${idx + 1}`}
                printSize={printSize}
                bundleSizeIds={bundleSizeIds}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
