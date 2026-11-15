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
