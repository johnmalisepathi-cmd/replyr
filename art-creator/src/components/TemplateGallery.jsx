import { templates, templateToDataUrl } from "../lib/templates";

export default function TemplateGallery({ activeId, onSelect }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
        Colouring templates
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            title={t.description}
            className={`group flex flex-col gap-2 rounded-xl border p-2 text-left transition ${
              activeId === t.id
                ? "border-fuchsia-400/60 bg-fuchsia-500/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <img
              src={templateToDataUrl(t.svg)}
              alt={t.name}
              className="aspect-[4/3] w-full rounded-lg border border-white/10 bg-white object-contain"
            />
            <span className="text-xs font-medium text-white/80">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
