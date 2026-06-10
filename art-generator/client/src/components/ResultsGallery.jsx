function downloadImage(src, filename) {
  const link = document.createElement("a");
  link.href = src;
  link.download = filename;
  link.click();
}

export default function ResultsGallery({ batches }) {
  if (batches.length === 0) {
    return (
      <div className="glass flex flex-1 flex-col items-center justify-center rounded-2xl p-10 text-center">
        <p className="text-lg font-medium text-white/70">Your generated artwork will appear here</p>
        <p className="mt-2 max-w-md text-sm text-white/40">
          Pick a style, describe your idea, and hit "Generate artwork" to create images you can download and use on
          Etsy.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
              <div key={idx} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
                <img src={src} alt={`Generated artwork ${idx + 1}`} className="aspect-square w-full object-cover" />
                <button
                  onClick={() => downloadImage(src, `${batch.styleId}-${batch.id}-${idx + 1}.png`)}
                  className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
