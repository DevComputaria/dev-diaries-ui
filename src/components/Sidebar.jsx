function formatLastUpdated(lastUpdated) {
  if (!lastUpdated) {
    return "Aguardando primeira sincronização";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(lastUpdated);
}

export default function Sidebar({
  repoOptions,
  selectedRepo,
  onSelectRepo,
  onRefresh,
  isRefreshing,
  totalItems,
  lastUpdated
}) {
  return (
    <aside className="top-0 h-fit w-full shrink-0 lg:sticky lg:max-w-sm lg:self-start xl:max-w-md">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-sky-950/30 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-sky-300 to-indigo-500 text-xl font-black text-slate-950 shadow-lg shadow-sky-900/40">
            DD
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-300/70">Engineering social feed</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Dev Diaries</h2>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-300">
          Diário de bordo para commits. Zero backend, build estático e pronto para viver em um planeta que só aceita HTML, CSS e JS.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Posts</p>
            <p className="mt-2 text-2xl font-semibold text-white">{totalItems}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Fontes</p>
            <p className="mt-2 text-2xl font-semibold text-white">{Math.max(repoOptions.length - 1, 0)}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Atualização manual</p>
              <p className="mt-1 text-xs text-slate-400">Última sincronização: {formatLastUpdated(lastUpdated)}</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center rounded-full border border-sky-300/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Sincronizando…" : "Atualizar"}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-400">Repos</p>
          <div className="flex flex-wrap gap-2">
            {repoOptions.map((repo) => {
              const isActive = repo === selectedRepo;
              const label = repo === "all" ? "Todos" : repo;

              return (
                <button
                  key={repo}
                  type="button"
                  onClick={() => onSelectRepo(repo)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-slate-950 shadow-lg shadow-white/10"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-300">
          <a
            href="https://github.com/DevComputaria"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sky-300 transition hover:text-sky-200"
          >
            Ver organização no GitHub
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
