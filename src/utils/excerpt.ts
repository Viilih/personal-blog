/** First ~2 prose lines from markdown/MDX body. Does not invent text. */
export function excerptFromBody(
  body: string | undefined,
  options: { maxLines?: number; maxChars?: number } = {},
): string | undefined {
  if (!body?.trim()) return undefined;

  const maxLines = options.maxLines ?? 2;
  const maxChars = options.maxChars ?? 220;

  let text = body
    .replace(/\r\n/g, "\n")
    .replace(/^import\s.+$/gm, "")
    .replace(/^export\s.+$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`~]/g, "");

  const lines = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (lines.length === 0) return undefined;

  // Prefer substantive prose over short heading leftovers.
  const substantive = lines.filter((line) => line.length >= 40);
  const chosen = (substantive.length > 0 ? substantive : lines).slice(
    0,
    maxLines,
  );

  let excerpt = chosen.join(" ").trim();
  if (excerpt.length > maxChars) {
    excerpt = `${excerpt.slice(0, maxChars).replace(/\s+\S*$/, "").trim()}…`;
  }

  return excerpt || undefined;
}

/** Prefer frontmatter description; otherwise body excerpt. */
export function previewText(
  description: string | undefined,
  body: string | undefined,
): string | undefined {
  const fromDescription = description?.trim();
  if (fromDescription) return fromDescription;
  return excerptFromBody(body);
}
