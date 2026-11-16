/** Site-wide identity and contact (home hero + #contact). */
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
  contact: {
    email: "gnlnascimento@gmail.com",
    linkedin: "https://www.linkedin.com/in/nunesdev/",
    github: "https://github.com/Viilih",
  },
} as const;

export type SiteLang = keyof typeof site.role;
