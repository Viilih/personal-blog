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
 * Copy sourced from /now Building. Omit `link` (or leave empty) to hide the project link.
 */
export const currentlyBuilding = {
  en: {
    name: "LedgerPay",
    summary:
      "Work in progress: a double-entry ledger in Java 21, Spring Boot 4, and PostgreSQL.",
    link: "",
  },
  "pt-br": {
    name: "LedgerPay",
    summary:
      "Em andamento: um ledger de partidas dobradas em Java 21, Spring Boot 4 e PostgreSQL.",
    link: "",
  },
} as const;
