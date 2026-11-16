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
   * Soft-pedals Spring Boot/Postgres per prefs (stack still listed lightly on /now).
   */
  about: {
    en: "I'm a fullstack developer on a platform engineering team at Vivo, through Stefanini. I work mainly with React and TypeScript, plus Node.js / NestJS. Outside work I study systems topics for Ledger Pay — databases, locks, and idempotency — and I'm building this digital garden.",
    "pt-br":
      "Sou desenvolvedor fullstack num time de platform engineering da Vivo, pela Stefanini. Trabalho principalmente com React e TypeScript, além de Node.js / NestJS. Fora do trabalho, estudo temas de sistemas para o Ledger Pay — banco de dados, locks e idempotência — e estou montando este digital garden.",
  },
  contact: {
    email: "gnlnascimento@gmail.com",
    linkedin: "https://www.linkedin.com/in/nunesdev/",
    github: "https://github.com/Viilih",
  },
} as const;

export type SiteLang = keyof typeof site.role;
