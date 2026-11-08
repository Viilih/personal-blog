export type InlinePart =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string };

export type NowBlock =
  | { type: "p"; inlines: InlinePart[] }
  | { type: "ul"; items: InlinePart[][] };

export type NowSection = {
  heading: string;
  blocks: NowBlock[];
};

export type NowPage = {
  title: string;
  label: string;
  updated?: string;
  sections: NowSection[];
};

const LINK = /\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;

export function parseInlines(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;

  for (const match of text.matchAll(LINK)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ type: "text", value: text.slice(last, index) });
    }
    parts.push({ type: "link", label: match[1], href: match[2] });
    last = index + match[0].length;
  }

  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }

  return parts;
}

function stripComments(input: string): string {
  return input.replace(/<!--[\s\S]*?-->/g, "");
}

export function parseSections(body: string): NowSection[] {
  const lines = stripComments(body).replace(/\r\n/g, "\n").split("\n");
  const sections: NowSection[] = [];
  let current: NowSection | null = null;
  let paragraph: string[] = [];
  let list: string[] | null = null;

  const flushParagraph = () => {
    if (!current || paragraph.length === 0) {
      paragraph = [];
      return;
    }
    const text = paragraph.join(" ").trim();
    paragraph = [];
    if (text) current.blocks.push({ type: "p", inlines: parseInlines(text) });
  };

  const flushList = () => {
    if (!current || !list) return;
    current.blocks.push({
      type: "ul",
      items: list.map((item) => parseInlines(item)),
    });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      current = { heading: line.slice(3).trim(), blocks: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith("- ")) {
      flushParagraph();
      list ??= [];
      list.push(line.slice(2).trim());
      continue;
    }
    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return sections.filter((section) => section.heading.length > 0);
}

function parseFrontmatter(source: string): {
  data: Record<string, string>;
  body: string;
} {
  const normalized = source.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("src/content/now.md is missing frontmatter.");
  }

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    const value = trimmed.slice(sep + 1).trim();
    if (key) data[key] = value;
  }

  return { data, body: match[2] };
}

function extractLang(body: string, lang: "en" | "pt-br"): string {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let capturing = false;
  let found = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "::en" || trimmed === "::pt-br") {
      if (capturing) break;
      capturing = trimmed === `::${lang}`;
      if (capturing) found = true;
      continue;
    }
    if (capturing) out.push(line);
  }

  if (!found) {
    throw new Error(`src/content/now.md is missing a ::${lang} section.`);
  }

  return out.join("\n");
}

export function parseNow(source: string, lang: "en" | "pt-br"): NowPage {
  const { data, body } = parseFrontmatter(source);
  const titleKey = lang === "en" ? "title_en" : "title_pt";
  const labelKey = lang === "en" ? "label_en" : "label_pt";
  const title = data[titleKey];
  const label = data[labelKey];

  if (!title || !label) {
    throw new Error(
      `src/content/now.md is missing ${titleKey} or ${labelKey}.`,
    );
  }

  const sections = parseSections(extractLang(body, lang));
  if (sections.length === 0) {
    throw new Error(`src/content/now.md ::${lang} has no ## sections.`);
  }

  const updated = /^\d{4}-\d{2}-\d{2}$/.test(data.updated ?? "")
    ? data.updated
    : undefined;

  return { title, label, updated, sections };
}
