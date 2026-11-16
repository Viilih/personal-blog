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
   * Home hero about, sourced from /now + Project prefs.
   * Work stack includes React/TS, Node/NestJS, and Java/Spring Boot.
   */
  about: {
    en: "I'm a full stack developer on a platform engineering team at Vivo, through Stefanini, working mostly with React, TypeScript, Node.js/NestJS, and Java/Spring Boot. Outside work, I study backend reliability (concurrency, race conditions) and data structures and algorithms, and I write about what I learn in this digital garden.",
    "pt-br":
      "Sou desenvolvedor full stack num time de platform engineering da Vivo, pela Stefanini. Trabalho principalmente com React, TypeScript, Node.js/NestJS e Java/Spring Boot. Fora do trabalho, estudo confiabilidade no backend (concorrência, race conditions) e estruturas de dados e algoritmos, e escrevo sobre o que aprendo neste digital garden.",
  },
  contact: {
    email: "gnlnascimento@gmail.com",
    linkedin: "https://www.linkedin.com/in/nunesdev/",
    github: "https://github.com/Viilih",
  },
} as const;

export type SiteLang = keyof typeof site.role;
