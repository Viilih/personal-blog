/** Shared /now metadata for the page stamp and light nav/home previews.
 *  Copy matches the existing /now Work intro (links stripped) — not invented. */
export const nowMeta = {
  en: {
    lastUpdatedDisplay: "November 9, 2026",
    lastUpdatedIso: "2026-11-09",
    updatedPrefix: "Last updated",
    blurb:
      "Fullstack developer on a platform engineering team at Vivo — one of Brazil's largest telecom companies — through Stefanini.",
  },
  "pt-br": {
    lastUpdatedDisplay: "9 de novembro de 2026",
    lastUpdatedIso: "2026-11-09",
    updatedPrefix: "Atualizado em",
    blurb:
      "Desenvolvedor fullstack em um time de platform engineering na Vivo — uma das maiores telecoms do Brasil — via Stefanini.",
  },
} as const;

export type NowLang = keyof typeof nowMeta;
