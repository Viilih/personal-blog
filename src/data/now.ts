/** Shared /now last-updated stamp (used by /now pages). */
export const nowMeta = {
  en: {
    lastUpdatedDisplay: "November 9, 2026",
    updatedPrefix: "Last updated",
  },
  "pt-br": {
    lastUpdatedDisplay: "9 de novembro de 2026",
    updatedPrefix: "Última atualização",
  },
} as const;

export type NowLang = keyof typeof nowMeta;

/**
 * Discreet “Currently building” highlight on the home page.
 * Copy sourced from /now Building + Studies (Ledger Pay / systems).
 * Omit `link` (or leave empty) to hide the project link.
 */
export const currentlyBuilding = {
  en: {
    name: "Ledger Pay",
    summary:
      "A personal payments project (studying databases, locks, and idempotency).",
    link: "https://github.com/Viilih/ledger-pay",
  },
  "pt-br": {
    name: "Ledger Pay",
    summary:
      "Projeto pessoal de pagamentos (estudo banco de dados, locks e idempotência).",
    link: "https://github.com/Viilih/ledger-pay",
  },
} as const;
