function parseStack(search) {
  const params = new URLSearchParams(search);
  const raw = params.get("stack");
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function writeStack(activeId, stack) {
  const url = new URL(window.location.href);
  const unique = [...new Set(stack.filter((id) => id && id !== activeId))];
  if (unique.length === 0) {
    url.searchParams.delete("stack");
  } else {
    url.searchParams.set("stack", unique.join(","));
  }
  window.history.replaceState({}, "", url);
}

export function initStackedNotes() {
  const root = document.querySelector("[data-notes-workspace]");
  if (!(root instanceof HTMLElement) || root.dataset.stackBound === "1") return;
  root.dataset.stackBound = "1";

  const stackEl = root.querySelector("[data-notes-stack]");
  const clearBtn = root.querySelector("[data-stack-clear]");
  const fragments = root.querySelector("[data-notes-fragments]");
  const catalogEl = root.querySelector("[data-notes-catalog]");
  if (!(stackEl instanceof HTMLElement) || !fragments) return;

  const activeId = root.dataset.activeNote || "";
  let catalog = [];
  try {
    catalog = JSON.parse(catalogEl?.textContent || "[]");
  } catch {
    catalog = [];
  }

  const fragmentMap = new Map();
  fragments.querySelectorAll("template[data-note-fragment]").forEach((tpl) => {
    if (!(tpl instanceof HTMLTemplateElement)) return;
    const id = tpl.dataset.noteFragment;
    if (id) fragmentMap.set(id, tpl);
  });

  const syncClear = () => {
    if (!(clearBtn instanceof HTMLElement)) return;
    const panes = stackEl.querySelectorAll("[data-note-pane]");
    clearBtn.hidden = panes.length <= 1;
  };

  const scrollToPane = (pane) => {
    pane.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  };

  const currentStack = () =>
    [...stackEl.querySelectorAll("[data-note-pane]")]
      .filter((el) => el instanceof HTMLElement)
      .map((el) => el.dataset.noteId || "")
      .filter(Boolean);

  const openPane = (noteId, fromPane) => {
    if (!noteId || noteId === activeId) {
      const primary = stackEl.querySelector(
        `[data-note-pane][data-note-id="${activeId}"]`,
      );
      if (primary instanceof HTMLElement) scrollToPane(primary);
      return;
    }

    const existing = stackEl.querySelector(
      `[data-note-pane][data-note-id="${noteId}"]`,
    );
    if (existing instanceof HTMLElement) {
      scrollToPane(existing);
      return;
    }

    const tpl = fragmentMap.get(noteId);
    if (!tpl) {
      const meta = catalog.find((n) => n.id === noteId);
      if (meta) window.location.href = meta.href;
      return;
    }

    const node = tpl.content.cloneNode(true);
    const pane = node.querySelector("[data-note-pane]");
    if (!(pane instanceof HTMLElement)) return;

    if (fromPane instanceof HTMLElement && fromPane.parentElement === stackEl) {
      let next = fromPane.nextElementSibling;
      while (next) {
        const remove = next;
        next = next.nextElementSibling;
        remove.remove();
      }
      fromPane.after(pane);
    } else {
      stackEl.appendChild(pane);
    }

    writeStack(activeId, currentStack());
    syncClear();
    requestAnimationFrame(() => scrollToPane(pane));
  };

  const onClick = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const closeBtn = target.closest("[data-pane-close]");
    if (closeBtn) {
      event.preventDefault();
      const pane = closeBtn.closest("[data-note-pane]");
      if (
        pane instanceof HTMLElement &&
        !pane.classList.contains("is-primary")
      ) {
        pane.remove();
        writeStack(activeId, currentStack());
        syncClear();
      }
      return;
    }

    const link = target.closest("a[data-note-link], a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;

    const noteId =
      link.dataset.noteLink ||
      link.getAttribute("href")?.match(
        /\/(?:en|pt-br)\/notes\/([a-z0-9-]+)\/?$/,
      )?.[1];

    if (!noteId) return;

    const lang = root.dataset.lang;
    const href = link.getAttribute("href") || "";
    if (!link.dataset.noteLink && lang && !href.includes(`/${lang}/notes/`)) {
      return;
    }

    event.preventDefault();
    const fromPane = link.closest("[data-note-pane]");
    openPane(noteId, fromPane instanceof HTMLElement ? fromPane : undefined);
  };

  root.addEventListener("click", onClick);

  clearBtn?.addEventListener("click", () => {
    stackEl
      .querySelectorAll("[data-note-pane]:not(.is-primary)")
      .forEach((pane) => pane.remove());
    writeStack(activeId, []);
    syncClear();
  });

  const initial = parseStack(window.location.search);
  for (const id of initial) {
    if (id !== activeId) openPane(id);
  }
  syncClear();
}

function boot() {
  document.querySelectorAll("[data-notes-workspace]").forEach((el) => {
    if (el instanceof HTMLElement) el.dataset.stackBound = "";
  });
  initStackedNotes();
}

boot();
document.addEventListener("astro:page-load", boot);
