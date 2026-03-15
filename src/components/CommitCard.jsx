function formatAbsoluteDate(value) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(date);
}

function formatRelativeDate(value) {
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals = [
    ["ano", 31536000],
    ["mês", 2592000],
    ["semana", 604800],
    ["dia", 86400],
    ["hora", 3600],
    ["minuto", 60]
  ];

  for (const [label, size] of intervals) {
    const amount = Math.floor(seconds / size);

    if (amount >= 1) {
      return `há ${amount} ${label}${amount > 1 ? amount === 1 || label === "mês" ? "es" : "s" : ""}`;
    }
  }

  return "agora mesmo";
}

export default function CommitCard({ item, onOpen }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur transition hover:-translate-y-0.5 hover:border-sky-300/30 hover:bg-slate-900/85">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
        <span className="rounded-full bg-sky-400/10 px-3 py-1 text-sky-200">{item.repo}</span>
        <span>{item.author}</span>
        <span>•</span>
        <time dateTime={item.date} title={formatAbsoluteDate(item.date)}>
          {formatRelativeDate(item.date)}
        </time>
      </div>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white transition group-hover:text-sky-100">
        {item.title}
      </h2>

      {item.excerpt ? (
        <p className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-7 text-slate-300">
          {item.excerpt}
          {item.content && item.content.length > item.excerpt.length ? "…" : ""}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
        <p className="text-sm text-slate-400">
          Publicado em <span className="text-slate-200">{formatAbsoluteDate(item.date)}</span>
        </p>
        <button
          type="button"
          onClick={() => onOpen(item.id)}
          className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
        >
          Abrir post
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}
