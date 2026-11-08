export function initVaultSearch(root) {
  if (!(root instanceof HTMLElement)) return;
  if (root.dataset.searchBound === "1") return;
  root.dataset.searchBound = "1";

  const input = root.querySelector("[data-vault-search-input]");
  const results = root.querySelector("[data-vault-search-results]");
  const empty = root.querySelector("[data-vault-search-empty]");
  const indexEl = root.querySelector("[data-vault-search-index]");
  if (
    !(input instanceof HTMLInputElement) ||
    !(results instanceof HTMLUListElement) ||
    !(empty instanceof HTMLElement) ||
    !indexEl
  ) {
    return;
  }

  let index = [];
  try {
    index = JSON.parse(indexEl.textContent || "[]");
  } catch {
    index = [];
  }

  const render = (query) => {
    const q = query.trim().toLowerCase();
    results.innerHTML = "";
    if (!q) {
      results.hidden = true;
      empty.hidden = true;
      return;
    }

    const matches = index
      .filter((item) => item.haystack.includes(q))
      .slice(0, 12);

    if (matches.length === 0) {
      results.hidden = true;
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    results.hidden = false;
    for (const item of matches) {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      const a = document.createElement("a");
      a.href = item.href;
      a.className = "vault-search__result";
      a.innerHTML = `<span class="vault-search__kind">${item.kind}</span><span class="vault-search__title">${item.title}</span>`;
      li.appendChild(a);
      results.appendChild(li);
    }
  };

  input.addEventListener("input", () => render(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      render("");
      input.blur();
    }
  });
}

function boot() {
  document.querySelectorAll("[data-vault-search]").forEach((root) => {
    if (root instanceof HTMLElement) root.dataset.searchBound = "";
    initVaultSearch(root);
  });
}

boot();
document.addEventListener("astro:page-load", boot);
