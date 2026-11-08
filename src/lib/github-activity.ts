export type PublicActivity = {
  id: string;
  label: string;
  href: string;
  date: string;
};

const MAX_ITEMS = 5;
const EVENTS_URL =
  "https://api.github.com/users/Viilih/events/public?per_page=15";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function truncate(text: string, max = 72): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 1).trimEnd()}…`;
}

function repoWebUrl(name: string): string {
  return `https://github.com/${name}`;
}

function shortRepo(name: string): string {
  const slash = name.lastIndexOf("/");
  return slash === -1 ? name : name.slice(slash + 1);
}

function commitSha(value: unknown): string | null {
  const sha = asString(value);
  return sha && /^[0-9a-f]{7,40}$/i.test(sha) ? sha : null;
}

function describe(
  type: string,
  repo: string,
  payload: Record<string, unknown>,
): { label: string; href: string } | null {
  const name = shortRepo(repo);
  const repoUrl = repoWebUrl(repo);

  if (type === "PushEvent") {
    const commits = Array.isArray(payload.commits) ? payload.commits : [];
    const records = commits
      .map(asRecord)
      .filter((commit): commit is Record<string, unknown> => commit !== null);
    const newest = records[records.length - 1];
    const subject = asString(newest?.message)?.split("\n")[0];
    const sha = commitSha(newest?.sha);
    const ref = asString(payload.ref)?.replace(/^refs\/heads\//, "");
    const label = subject
      ? `${name} · ${truncate(subject)}`
      : ref
        ? `${name} · pushed ${ref}`
        : null;
    if (!label) return null;
    return { label, href: sha ? `${repoUrl}/commit/${sha}` : repoUrl };
  }

  if (type === "PullRequestEvent") {
    const action = asString(payload.action);
    const pull = asRecord(payload.pull_request);
    const number =
      typeof payload.number === "number"
        ? payload.number
        : typeof pull?.number === "number"
          ? pull.number
          : null;
    if (!action || number === null) return null;
    const title = asString(pull?.title);
    const label = title
      ? `${name} · ${action} #${number}: ${truncate(title, 48)}`
      : `${name} · ${action} #${number}`;
    return { label, href: `${repoUrl}/pull/${number}` };
  }

  if (type === "IssuesEvent") {
    const action = asString(payload.action);
    const issue = asRecord(payload.issue);
    const number = typeof issue?.number === "number" ? issue.number : null;
    if (!action || number === null) return null;
    const title = asString(issue?.title);
    const label = title
      ? `${name} · ${action} issue #${number}: ${truncate(title, 48)}`
      : `${name} · ${action} issue #${number}`;
    return { label, href: `${repoUrl}/issues/${number}` };
  }

  if (type === "IssueCommentEvent") {
    const issue = asRecord(payload.issue);
    const number = typeof issue?.number === "number" ? issue.number : null;
    if (number === null) return null;
    return {
      label: `${name} · commented on #${number}`,
      href: `${repoUrl}/issues/${number}`,
    };
  }

  if (type === "CreateEvent") {
    const refType = asString(payload.ref_type);
    if (!refType) return null;
    const ref = asString(payload.ref);
    const label = ref
      ? `${name} · created ${refType} ${ref}`
      : `${name} · created ${refType}`;
    return { label, href: repoUrl };
  }

  if (type === "ReleaseEvent") {
    const release = asRecord(payload.release);
    const tag = asString(release?.tag_name) ?? asString(payload.tag_name);
    if (!tag) return null;
    return {
      label: `${name} · release ${tag}`,
      href: `${repoUrl}/releases/tag/${tag}`,
    };
  }

  if (type === "ForkEvent") {
    return { label: `forked ${name}`, href: repoUrl };
  }

  if (type === "WatchEvent") {
    return { label: `starred ${name}`, href: repoUrl };
  }

  if (type === "PublicEvent") {
    return { label: `${name} · made public`, href: repoUrl };
  }

  return null;
}

export function normalizePublicEvents(payload: unknown): PublicActivity[] {
  if (!Array.isArray(payload)) return [];

  const items: PublicActivity[] = [];
  for (const entry of payload) {
    const event = asRecord(entry);
    if (!event) continue;
    const type = asString(event.type);
    const repo = asRecord(event.repo);
    const repoName = asString(repo?.name);
    const date = asString(event.created_at);
    const id = asString(event.id);
    if (!type || !repoName || !date || !id) continue;

    const described = describe(type, repoName, asRecord(event.payload) ?? {});
    if (!described) continue;

    items.push({ id, date, ...described });
    if (items.length === MAX_ITEMS) break;
  }

  return items;
}

async function fetchPublicEvents(): Promise<PublicActivity[]> {
  try {
    const response = await fetch(EVENTS_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "vili-blog",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    return normalizePublicEvents(await response.json());
  } catch {
    return [];
  }
}

let cached: Promise<PublicActivity[]> | undefined;

/** Public events only. Empty when GitHub is down, rate-limited, or returns nothing. */
export function loadPublicGithubActivity(): Promise<PublicActivity[]> {
  cached ??= fetchPublicEvents();
  return cached;
}
