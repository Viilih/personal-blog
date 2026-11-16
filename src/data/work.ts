export type WorkItem = {
  id: string;
  /** Image under /public/work — 16:10. */
  image: {
    src: string;
    width: number;
    height: number;
    alt: { en: string; "pt-br": string };
  };
  title: { en: string; "pt-br": string };
  /** One-sentence summary — placeholder copy Guilherme will replace. */
  summary: { en: string; "pt-br": string };
  /** Stack shown in mono. */
  stack: string[];
  repoUrl: string;
  /** Optional live demo; omit or null when none. */
  demoUrl: string | null;
};

/**
 * Featured projects on the home #work section.
 * Titles/summaries/images are placeholders for Guilherme to replace.
 */
export const workItems: WorkItem[] = [
  {
    id: "web-server-node",
    image: {
      src: "/work/web-server-node.png",
      width: 960,
      height: 600,
      alt: {
        en: "Placeholder screenshot for web-server-node",
        "pt-br": "Captura placeholder do web-server-node",
      },
    },
    title: {
      en: "web-server-node",
      "pt-br": "web-server-node",
    },
    summary: {
      en: "Placeholder: a small Node HTTP server project — replace this sentence.",
      "pt-br":
        "Placeholder: um servidor HTTP pequeno em Node — substitua esta frase.",
    },
    stack: ["Node.js", "HTTP", "JavaScript"],
    repoUrl: "https://github.com/Viilih/web-server-node",
    demoUrl: null,
  },
  {
    id: "VSA-voting-system",
    image: {
      src: "/work/vsa-voting-system.png",
      width: 960,
      height: 600,
      alt: {
        en: "Placeholder screenshot for VSA-voting-system",
        "pt-br": "Captura placeholder do VSA-voting-system",
      },
    },
    title: {
      en: "VSA-voting-system",
      "pt-br": "VSA-voting-system",
    },
    summary: {
      en: "Placeholder: voting system with Vertical Slice Architecture — replace this sentence.",
      "pt-br":
        "Placeholder: sistema de votação com Vertical Slice Architecture — substitua esta frase.",
    },
    stack: [".NET", "RabbitMQ", "VSA"],
    repoUrl: "https://github.com/Viilih/VSA-voting-system",
    demoUrl: null,
  },
  {
    id: "ConvertEase",
    image: {
      src: "/work/convertease.png",
      width: 960,
      height: 600,
      alt: {
        en: "Placeholder screenshot for ConvertEase",
        "pt-br": "Captura placeholder do ConvertEase",
      },
    },
    title: {
      en: "ConvertEase",
      "pt-br": "ConvertEase",
    },
    summary: {
      en: "Placeholder: file conversion web app — replace this sentence.",
      "pt-br":
        "Placeholder: app web de conversão de arquivos — substitua esta frase.",
    },
    stack: ["TypeScript", "React", "Vite"],
    repoUrl: "https://github.com/Viilih/ConvertEase",
    demoUrl: "https://convert-ease-sigma.vercel.app/",
  },
];
