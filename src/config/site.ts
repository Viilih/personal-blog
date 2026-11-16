/** Site-wide identity and contact (home hero mailto + site footer). */
export const site = {
  name: "Guilherme Nascimento",
  /** One-line role used with city on the home hero. */
  role: {
    en: "Software engineer · fullstack",
    "pt-br": "Engenheiro de software · fullstack",
  },
  city: {
    en: "Rio de Janeiro",
    "pt-br": "Rio de Janeiro",
  },
  /**
   * Home hero about — sourced from /now + Project prefs.
   * Work stack includes React/TS, Node/NestJS, and Java/Spring Boot.
   */
  about: {
    en: "I'm a fullstack developer on a platform engineering team at Vivo, through Stefanini. I work mainly with React, TypeScript, Node.js / NestJS, and Java / Spring Boot. Outside work I study databases, locks, and idempotency for Ledger Pay — the reliability a payments backend needs — and I'm building this digital garden.",
    "pt-br":
      "Sou desenvolvedor fullstack num time de platform engineering da Vivo, pela Stefanini. Trabalho principalmente com React, TypeScript, Node.js / NestJS e Java / Spring Boot. Fora do trabalho, estudo banco de dados, locks e idempotência para o Ledger Pay — a confiabilidade que um backend de pagamentos precisa — e estou montando este digital garden.",
  },
  contact: {
    email: "gnlnascimento@gmail.com",
    linkedin: "https://www.linkedin.com/in/nunesdev/",
    github: "https://github.com/Viilih",
  },
} as const;

export type SiteLang = keyof typeof site.role;
