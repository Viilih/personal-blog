/** Shared /now last-updated stamp (used by /now pages). */
export const nowMeta = {
  en: {
    lastUpdatedDisplay: "November 9, 2026",
    updatedPrefix: "Last updated",
  },
  "pt-br": {
    lastUpdatedDisplay: "9 de novembro de 2026",
    updatedPrefix: "Atualizado em",
  },
} as const;

export type NowLang = keyof typeof nowMeta;

/**
 * Discreet “Currently building” highlight on the home page.
 * Placeholder copy — Guilherme will replace name/summary/link.
 * Omit `link` (or leave empty) to hide the project link.
 */
export const currentlyBuilding = {
  en: {
    name: "Placeholder project",
    summary:
      "Placeholder: a short sentence about what I’m building right now.",
    link: "https://github.com/Viilih",
  },
  "pt-br": {
    name: "Projeto placeholder",
    summary:
      "Placeholder: uma frase curta sobre o que estou construindo agora.",
    link: "https://github.com/Viilih",
  },
} as const;
