export function initVaultTree() {
  document.querySelectorAll("[data-vault-toggle]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    if (button.dataset.bound === "1") return;
    button.dataset.bound = "1";

    button.addEventListener("click", () => {
      const branch = button.closest("[data-vault-branch]");
      const children = branch?.querySelector("[data-vault-children]");
      if (!(children instanceof HTMLElement)) return;

      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      children.hidden = expanded;
      const icon = button.querySelector("span");
      if (icon) icon.textContent = expanded ? "▸" : "▾";
    });
  });
}

initVaultTree();
document.addEventListener("astro:page-load", initVaultTree);
