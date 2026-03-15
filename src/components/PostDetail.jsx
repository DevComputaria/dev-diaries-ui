import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function formatAbsoluteDate(value) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(date);
}

export default function PostDetail({ item, onBack }) {
  const markdownContent = item.content || item.rawContent || "Sem conteúdo disponível para este post.";

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="border-b border-white/10 bg-gradient-to-r from-sky-400/10 via-transparent to-indigo-400/10 p-6 sm:p-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        >
          <span aria-hidden="true">←</span>
          Voltar para a timeline
        </button>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
          <span className="rounded-full bg-sky-400/10 px-3 py-1 text-sky-200">{item.repo}</span>
          <span>{item.author}</span>
          <span>•</span>
          <time dateTime={item.date}>{formatAbsoluteDate(item.date)}</time>
        </div>

        <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {item.title}
        </h1>

        <div className="mt-5 flex flex-wrap gap-3">
          {item.issueLink ? (
            <a
              href={item.issueLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
            >
              Abrir issue relacionada
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}

          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Ver commit original
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5 sm:p-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="mb-5 mt-2 text-4xl font-bold tracking-tight text-white">{children}</h1>,
              h2: ({ children }) => <h2 className="mb-4 mt-8 text-3xl font-semibold tracking-tight text-white">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-3 mt-6 text-2xl font-semibold text-sky-100">{children}</h3>,
              h4: ({ children }) => <h4 className="mb-3 mt-5 text-xl font-semibold text-sky-100">{children}</h4>,
              p: ({ children }) => <p className="my-4 text-[15px] leading-8 text-slate-200">{children}</p>,
              ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 text-slate-200 marker:text-sky-300">{children}</ul>,
              ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6 text-slate-200 marker:text-sky-300">{children}</ol>,
              li: ({ children }) => <li className="pl-1 leading-8">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="my-6 border-l-4 border-sky-400/50 bg-sky-400/5 px-5 py-3 text-slate-300 italic">
                  {children}
                </blockquote>
              ),
              code: ({ children, className }) => {
                const content = String(children);
                const isBlock = content.includes("\n");

                if (isBlock) {
                  return (
                    <code className={`block overflow-x-auto rounded-xl bg-slate-950/90 px-4 py-3 font-mono text-sm text-sky-200 ${className ?? ""}`}>
                      {content}
                    </code>
                  );
                }

                return (
                  <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[0.95em] text-sky-200">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/90 p-4">
                  {children}
                </pre>
              ),
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noreferrer" className="font-medium text-sky-300 underline decoration-sky-400/40 underline-offset-4 transition hover:text-sky-200">
                  {children}
                </a>
              ),
              hr: () => <hr className="my-8 border-white/10" />,
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              em: ({ children }) => <em className="italic text-slate-100">{children}</em>
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}