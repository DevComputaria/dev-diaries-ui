import yaml from "js-yaml";
import feedsConfigRaw from "../../config/feeds.yaml?raw";

const PROXIES = [
  {
    name: "allorigins",
    createUrl: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  },
  {
    name: "codetabs",
    createUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  }
];

function parseConfig() {
  const parsed = yaml.load(feedsConfigRaw);

  if (!parsed || !Array.isArray(parsed.feeds) || parsed.feeds.length === 0) {
    throw new Error("Nenhum feed configurado em config/feeds.yaml.");
  }

  return parsed.feeds;
}

async function fetchFeedXml(url) {
  let lastError = null;

  for (const proxy of PROXIES) {
    try {
      const response = await fetch(proxy.createUrl(url));

      if (!response.ok) {
        throw new Error(`Proxy ${proxy.name} respondeu com status ${response.status}.`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Não foi possível acessar o feed remoto. Último erro: ${lastError instanceof Error ? lastError.message : "falha desconhecida"}`
  );
}

function textContent(node, selector) {
  return node.querySelector(selector)?.textContent?.trim() ?? "";
}

function normalizeMultilineText(value) {
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

  const nonEmptyLines = normalized
    .split("\n")
    .filter((line) => line.trim().length > 0);

  const commonIndent = nonEmptyLines.reduce((smallestIndent, line) => {
    const indent = line.match(/^\s*/)?.[0].length ?? 0;

    if (smallestIndent === null) {
      return indent;
    }

    return Math.min(smallestIndent, indent);
  }, null);

  if (!commonIndent) {
    return normalized;
  }

  return normalized
    .split("\n")
    .map((line) => line.slice(commonIndent))
    .join("\n");
}

function extractTextFromContentHtml(contentHtml) {
  if (!contentHtml) {
    return "";
  }

  const document = new DOMParser().parseFromString(contentHtml, "text/html");
  const pre = document.querySelector("pre");
  const source = pre?.textContent ?? document.body?.textContent ?? contentHtml;
  return normalizeMultilineText(source);
}

function buildExcerpt(content) {
  if (!content) {
    return "";
  }

  return content
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~`>#-]+/g, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function extractFeedMetadata(title, fullText) {
  const lines = fullText.split("\n");
  const normalizedTitle = title.trim();
  const shortTitle = normalizedTitle.includes(":") ? normalizedTitle.split(":").slice(1).join(":").trim() : normalizedTitle;
  const cleanedLines = [...lines];

  while (cleanedLines[0] && cleanedLines[0].trim() === normalizedTitle) {
    cleanedLines.shift();
  }

  while (cleanedLines[0] !== undefined && cleanedLines[0].trim() === "") {
    cleanedLines.shift();
  }

  const issueLine = cleanedLines.find((line) => line.startsWith("Issue link:"));
  const issueLink = issueLine?.replace("Issue link:", "").trim() ?? "";

  const bodyIndex = cleanedLines.findIndex((line) => line.trim() === "Body:");

  if (bodyIndex >= 0) {
    const bodyLines = cleanedLines.slice(bodyIndex + 1);

    while (bodyLines[0] !== undefined && bodyLines[0].trim() === "") {
      bodyLines.shift();
    }

    if (bodyLines[0]?.trim() === shortTitle || bodyLines[0]?.trim() === normalizedTitle) {
      bodyLines.shift();
    }

    while (bodyLines[0] !== undefined && bodyLines[0].trim() === "") {
      bodyLines.shift();
    }

    if (bodyLines[0]?.trim() === "---") {
      bodyLines.shift();
    }

    while (bodyLines[0] !== undefined && bodyLines[0].trim() === "") {
      bodyLines.shift();
    }

    const content = normalizeMultilineText(bodyLines.join("\n"));
    return { issueLink, content, excerpt: buildExcerpt(content) };
  }

  const dividerIndex = cleanedLines.findIndex((line) => line.trim() === "---");

  if (dividerIndex >= 0) {
    const bodyLines = cleanedLines.slice(dividerIndex + 1);
    const content = normalizeMultilineText(bodyLines.join("\n"));
    return { issueLink, content, excerpt: buildExcerpt(content) };
  }

  const content = normalizeMultilineText(cleanedLines.join("\n"));
  return { issueLink, content, excerpt: buildExcerpt(content) };
}

function parseFeedEntries(xmlText, repoName) {
  const document = new DOMParser().parseFromString(xmlText, "application/xml");
  const parseError = document.querySelector("parsererror");

  if (parseError) {
    throw new Error("O feed retornou XML inválido.");
  }

  return [...document.querySelectorAll("entry")].map((entry, index) => {
    const title = textContent(entry, "title") || "Commit sem título";
    const author = textContent(entry, "author > name") || textContent(entry, "author") || "unknown";
    const date = textContent(entry, "updated") || textContent(entry, "published") || new Date().toISOString();
    const contentHtml = textContent(entry, "content") || textContent(entry, "summary");
    const link =
      entry.querySelector('link[rel="alternate"]')?.getAttribute("href") ||
      entry.querySelector("link")?.getAttribute("href") ||
      "#";
    const fullText = extractTextFromContentHtml(contentHtml);
    const metadata = extractFeedMetadata(title, fullText);

    return {
      id: `${repoName}-${link}-${index}`,
      title: title.trim(),
      author,
      date,
      repo: repoName,
      excerpt: metadata.excerpt,
      content: metadata.content,
      rawContent: fullText,
      issueLink: metadata.issueLink,
      link
    };
  });
}

export async function loadConfiguredFeeds() {
  const configuredFeeds = parseConfig();

  const results = await Promise.all(
    configuredFeeds.map(async (feed) => {
      if (!feed?.name || !feed?.url) {
        throw new Error("Cada feed precisa ter name e url em config/feeds.yaml.");
      }

      const xmlText = await fetchFeedXml(feed.url);
      return parseFeedEntries(xmlText, feed.name);
    })
  );

  return results
    .flat()
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
}
