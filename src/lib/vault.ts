import { getCollection, type CollectionEntry } from "astro:content";
import type { ui } from "../i18n/ui";

export type Lang = keyof typeof ui;

export type VaultKind = "article" | "note" | "weekly";

export type VaultItem = {
  id: string;
  title: string;
  href: string;
  kind: VaultKind;
  pubDate: Date;
  draft: boolean;
};

export type VaultSection = {
  id: string;
  labelKey:
    | "sidebar.blog"
    | "sidebar.notes"
    | "sidebar.weekly"
    | "sidebar.learning"
    | "sidebar.now"
    | "sidebar.home";
  href: string;
  items: VaultItem[];
  collapsible: boolean;
};

export type NoteLinkGraph = {
  /** noteId → outbound note ids */
  outbound: Record<string, string[]>;
  /** noteId → inbound note ids (backlinks) */
  inbound: Record<string, string[]>;
};

const NOTE_HREF_RE = /\/(?:en|pt-br)\/notes\/([a-z0-9-]+)/gi;
const MD_NOTE_LINK_RE =
  /\[[^\]]*\]\(\/(?:en|pt-br)\/notes\/([a-z0-9-]+)\)/gi;

function collectionFor(
  lang: Lang,
  kind: VaultKind,
):
  | "en"
  | "pt-br"
  | "en-notes"
  | "pt-br-notes"
  | "en-weekly"
  | "pt-br-weekly" {
  if (kind === "article") return lang === "en" ? "en" : "pt-br";
  if (kind === "note") return lang === "en" ? "en-notes" : "pt-br-notes";
  return lang === "en" ? "en-weekly" : "pt-br-weekly";
}

function hrefFor(lang: Lang, kind: VaultKind, id: string): string {
  if (kind === "article") return `/${lang}/blog/${id}`;
  if (kind === "note") return `/${lang}/notes/${id}`;
  return `/${lang}/learning/weekly/${id}`;
}

function toVaultItem(
  lang: Lang,
  kind: VaultKind,
  entry: { id: string; data: { title: string; pubDate: Date; draft: boolean } },
): VaultItem {
  return {
    id: entry.id,
    title: entry.data.title,
    href: hrefFor(lang, kind, entry.id),
    kind,
    pubDate: entry.data.pubDate,
    draft: entry.data.draft,
  };
}

function sortByDateDesc(items: VaultItem[]): VaultItem[] {
  return [...items].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );
}

async function safeCollection(
  name:
    | "en"
    | "pt-br"
    | "en-notes"
    | "pt-br-notes"
    | "en-weekly"
    | "pt-br-weekly",
) {
  try {
    return await getCollection(name, (e) => !e.data.draft);
  } catch {
    return [];
  }
}

export async function getVaultItems(lang: Lang): Promise<{
  articles: VaultItem[];
  notes: VaultItem[];
  weekly: VaultItem[];
}> {
  const [articles, notes, weekly] = await Promise.all([
    safeCollection(collectionFor(lang, "article")),
    safeCollection(collectionFor(lang, "note")),
    safeCollection(collectionFor(lang, "weekly")),
  ]);

  return {
    articles: sortByDateDesc(
      articles.map((e) => toVaultItem(lang, "article", e)),
    ),
    notes: sortByDateDesc(notes.map((e) => toVaultItem(lang, "note", e))),
    weekly: sortByDateDesc(weekly.map((e) => toVaultItem(lang, "weekly", e))),
  };
}

export async function getVaultSections(lang: Lang): Promise<VaultSection[]> {
  const { articles, notes, weekly } = await getVaultItems(lang);

  return [
    {
      id: "home",
      labelKey: "sidebar.home",
      href: `/${lang}`,
      items: [],
      collapsible: false,
    },
    {
      id: "articles",
      labelKey: "sidebar.blog",
      href: `/${lang}/articles`,
      items: articles,
      collapsible: true,
    },
    {
      id: "notes",
      labelKey: "sidebar.notes",
      href: `/${lang}/notes`,
      items: notes,
      collapsible: true,
    },
    {
      id: "weekly",
      labelKey: "sidebar.weekly",
      href: `/${lang}/learning/weekly`,
      items: weekly,
      collapsible: true,
    },
    {
      id: "learning",
      labelKey: "sidebar.learning",
      href: `/${lang}/learning`,
      items: [],
      collapsible: false,
    },
    {
      id: "now",
      labelKey: "sidebar.now",
      href: `/${lang}/now`,
      items: [],
      collapsible: false,
    },
  ];
}

export async function getSearchIndex(lang: Lang): Promise<
  Array<{
    id: string;
    title: string;
    href: string;
    kind: VaultKind;
    haystack: string;
  }>
> {
  const { articles, notes, weekly } = await getVaultItems(lang);
  return [...articles, ...notes, ...weekly].map((item) => ({
    id: item.id,
    title: item.title,
    href: item.href,
    kind: item.kind,
    haystack: `${item.title} ${item.kind} ${item.id}`.toLowerCase(),
  }));
}

/** Extract note ids linked from markdown/MDX source text. */
export function extractNoteIdsFromSource(
  source: string,
  knownIds: Set<string>,
): string[] {
  const found = new Set<string>();

  for (const re of [MD_NOTE_LINK_RE, NOTE_HREF_RE]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(source)) !== null) {
      const id = match[1];
      if (knownIds.has(id)) found.add(id);
    }
  }

  return [...found];
}

type NoteEntry =
  | CollectionEntry<"en-notes">
  | CollectionEntry<"pt-br-notes">;

export async function buildNoteLinkGraph(lang: Lang): Promise<NoteLinkGraph> {
  const collection = collectionFor(lang, "note");
  const notes = await getCollection(collection, (e) => !e.data.draft);
  const knownIds = new Set(notes.map((n) => n.id));

  const outbound: Record<string, string[]> = {};
  const inbound: Record<string, string[]> = {};

  for (const id of knownIds) {
    outbound[id] = [];
    inbound[id] = [];
  }

  for (const note of notes as NoteEntry[]) {
    const body = "body" in note && typeof note.body === "string" ? note.body : "";
    const targets = extractNoteIdsFromSource(body, knownIds).filter(
      (id) => id !== note.id,
    );
    outbound[note.id] = targets;
    for (const target of targets) {
      if (!inbound[target].includes(note.id)) {
        inbound[target].push(note.id);
      }
    }
  }

  return { outbound, inbound };
}

export async function getNoteBacklinks(
  lang: Lang,
  noteId: string,
): Promise<VaultItem[]> {
  const graph = await buildNoteLinkGraph(lang);
  const { notes } = await getVaultItems(lang);
  const byId = new Map(notes.map((n) => [n.id, n]));
  return (graph.inbound[noteId] ?? [])
    .map((id) => byId.get(id))
    .filter((n): n is VaultItem => Boolean(n));
}
