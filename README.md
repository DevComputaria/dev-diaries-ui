# Dev Diaries UI 🚀

> "Computer… display the captain's log." — Jean-Luc Picard

Um **engineering social feed** em estilo Tumblr para commits do GitHub, totalmente estático e pronto para GitHub Pages.

O projeto consome feeds Atom diretamente no navegador, transforma cada entrada em um post e abre o conteúdo completo dentro da própria UI — incluindo **Markdown renderizado** com headings, listas, blockquotes e code blocks.

## ✨ Funcionalidades atuais

- ⚛️ **React + Vite** para uma SPA rápida e leve
- 🎨 **Tailwind CSS** com visual dark / Tumblr técnico
- 🌍 **Sem backend**: tudo roda no frontend
- 📡 **Consumo de Atom feed no browser** com fallback de proxy CORS
- 🧠 **Parser próprio** para limpar o payload do GitHub Atom
- 📝 **Renderização Markdown** com `react-markdown` + `remark-gfm`
- 🔎 **Página interna de detalhe** para cada post/commit
- 🧭 **Navegação por hash** (`#/post/...`) compatível com GitHub Pages
- 🔁 **Auto-refresh** do feed a cada 5 minutos
- 🚀 **Deploy automático** no GitHub Pages via GitHub Actions

## 🛰️ Arquitetura atual

```text
GitHub commits.atom
  ↓
proxy CORS (fallback)
  ↓
DOMParser + limpeza do conteúdo
  ↓
extração de title / body / issueLink / markdown
  ↓
timeline React + página interna do post
  ↓
dist/
```

## 🖼️ Fluxo da interface

```text
Sidebar           → filtros por repositório + refresh
Timeline          → cards com preview do conteúdo
Post detail page  → renderização completa do markdown
```

Ao clicar em um card, o usuário abre o conteúdo completo dentro da própria SPA, em vez de ir direto para o commit no GitHub.

## 🚀 Como rodar localmente

### 1. Instale as dependências

```bash
npm install
```

### 2. Rode em desenvolvimento

```bash
npm run dev
```

### 3. Gere a build estática

```bash
npm run build
```

### 4. Visualize a build localmente

```bash
npm run preview
```

## 📦 Estrutura do projeto

```text
feed-rss-commit/
├── .github/
│   ├── prompts/
│   └── workflows/
│       └── deploy-pages.yml
├── config/
│   └── feeds.yaml
├── src/
│   ├── components/
│   │   ├── CommitCard.jsx
│   │   ├── PostDetail.jsx
│   │   └── Sidebar.jsx
│   ├── services/
│   │   └── rssParser.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## ⚙️ Configuração dos feeds

Edite `config/feeds.yaml` para adicionar ou remover feeds Atom:

```yaml
feeds:
  - name: dev-diaries
    url: https://github.com/DevComputaria/dev-diaries/commits/main.atom
  - name: outro-repo
    url: https://github.com/username/repo/commits/main.atom
```

## 🧩 Como o parser trata o conteúdo

O GitHub Atom pode trazer mensagens de commit com conteúdo rico, como:

- `Issue link:`
- `Body:`
- Markdown com `##`, listas, code spans e separadores `---`

O serviço em `src/services/rssParser.js` faz:

1. leitura do XML via `DOMParser`
2. extração do `<pre>` do feed
3. normalização de whitespace e indentação
4. separação entre cabeçalho e corpo
5. extração de `issueLink`
6. geração de `excerpt` para o card
7. envio do conteúdo completo para a página de detalhe

## 📝 Renderização Markdown

O detalhe do post usa:

- `react-markdown`
- `remark-gfm`

Com isso, a UI renderiza corretamente:

- headings `#`, `##`, `###`
- listas ordenadas e não ordenadas
- blockquotes
- code blocks e inline code
- links
- divisores `---`
- negrito e itálico

## 🌐 Deploy no GitHub Pages

Este projeto usa **GitHub Actions** para publicar a pasta `dist/`.

### Configuração no GitHub

1. Vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Faça push para a branch principal

O workflow irá:

1. instalar dependências
2. gerar a build com Vite
3. publicar `dist/` no GitHub Pages

## 📌 Observações importantes

- A build usa `base: "./"` para funcionar em subdiretórios do GitHub Pages sem depender do nome do repositório.
- A navegação interna usa hash routing para evitar problemas de refresh em hospedagem estática.
- O consumo do feed depende de proxies CORS públicos, com fallback para mais de uma opção.
- O GitHub Atom pode mudar o formato do conteúdo; por isso o parser foi feito para ser tolerante a variações comuns.

## 🔧 Scripts disponíveis

- `npm run dev` — servidor local com Vite
- `npm run build` — build de produção
- `npm run preview` — pré-visualização da build gerada

## 🌌 Próximos upgrades possíveis

- [ ] Infinite scroll
- [ ] Filtro por autor
- [ ] Busca textual nos posts
- [ ] Feed de releases / PRs / issues
- [ ] Cards com preview de diff
- [ ] Rotas amigáveis por slug
- [ ] Tipografia editorial mais rica para os posts

## 📝 License

MIT

---

**Engineering Social Feed** — diário de bordo de commits, sem backend, com Markdown de verdade e com menos drama orbital.
