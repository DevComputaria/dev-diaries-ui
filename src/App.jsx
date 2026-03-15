import { useEffect, useMemo, useState } from "react";
import CommitCard from "./components/CommitCard";
import PostDetail from "./components/PostDetail";
import Sidebar from "./components/Sidebar";
import { loadConfiguredFeeds } from "./services/rssParser";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function getPostIdFromHash() {
  const match = window.location.hash.match(/^#\/post\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function openPost(id) {
  window.location.hash = `/post/${encodeURIComponent(id)}`;
}

function closePost() {
  window.location.hash = "";
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur"
        >
          <div className="mb-4 h-4 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="mb-3 h-7 w-4/5 animate-pulse rounded-full bg-white/10" />
          <div className="mb-2 h-4 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300">
      <p className="text-lg font-medium">Nenhum commit encontrado ainda.</p>
      <p className="mt-2 text-sm text-slate-400">Adicione um feed Atom em <code>config/feeds.yaml</code> e tente novamente.</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-[2rem] border border-rose-400/30 bg-rose-500/10 p-8 text-center text-rose-100">
      <p className="text-lg font-semibold">Falha ao carregar o feed</p>
      <p className="mt-2 text-sm text-rose-100/80">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center rounded-full border border-rose-300/40 bg-rose-400/10 px-4 py-2 text-sm font-medium transition hover:bg-rose-400/20"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState("all");
  const [selectedPostId, setSelectedPostId] = useState(() => getPostIdFromHash());

  async function refreshFeed() {
    setStatus((current) => (current === "ready" ? "refreshing" : "loading"));
    setError("");

    try {
      const nextItems = await loadConfiguredFeeds();
      setItems(nextItems);
      setLastUpdated(new Date());
      setStatus("ready");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro desconhecido ao carregar commits.");
      setStatus("error");
    }
  }

  useEffect(() => {
    refreshFeed();

    const intervalId = window.setInterval(() => {
      refreshFeed();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setSelectedPostId(getPostIdFromHash());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const repoOptions = useMemo(() => {
    const names = [...new Set(items.map((item) => item.repo))];
    return ["all", ...names];
  }, [items]);

  const visibleItems = useMemo(() => {
    if (selectedRepo === "all") {
      return items;
    }

    return items.filter((item) => item.repo === selectedRepo);
  }, [items, selectedRepo]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedPostId) ?? null,
    [items, selectedPostId]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#020617_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 lg:flex-row lg:px-6">
        <Sidebar
          repoOptions={repoOptions}
          selectedRepo={selectedRepo}
          onSelectRepo={setSelectedRepo}
          onRefresh={refreshFeed}
          isRefreshing={status === "refreshing" || status === "loading"}
          totalItems={items.length}
          lastUpdated={lastUpdated}
        />

        <main className="min-w-0 flex-1 pb-10 lg:pt-2">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sky-300/70">Captain&apos;s log</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {selectedItem ? "Post completo" : "Feed de commits estilo Tumblr"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                {selectedItem
                  ? "Agora o conteúdo abre dentro da própria UI, com leitura confortável e sem te arremessar direto para fora da nave."
                  : "Uma timeline estática que transforma feeds Atom do GitHub em posts de engenharia — pronta para orbitar no GitHub Pages."}
              </p>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 backdrop-blur sm:block">
              {selectedItem
                ? selectedItem.repo
                : selectedRepo === "all"
                  ? "Todos os repositórios"
                  : `Filtro: ${selectedRepo}`}
            </div>
          </div>

          {status === "loading" ? <LoadingState /> : null}
          {status === "error" ? <ErrorState message={error} onRetry={refreshFeed} /> : null}
          {status === "ready" && !selectedItem && visibleItems.length === 0 ? <EmptyState /> : null}

          {status === "ready" && selectedPostId && !selectedItem ? (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300">
              <p className="text-lg font-medium">Esse post não foi encontrado no feed atual.</p>
              <button
                type="button"
                onClick={closePost}
                className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
              >
                Voltar para a timeline
              </button>
            </div>
          ) : null}

          {status !== "loading" && selectedItem ? <PostDetail item={selectedItem} onBack={closePost} /> : null}

          {(status === "ready" || status === "refreshing") && !selectedItem && visibleItems.length > 0 ? (
            <div className="space-y-5">
              {visibleItems.map((item) => (
                <CommitCard key={item.id} item={item} onOpen={openPost} />
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
