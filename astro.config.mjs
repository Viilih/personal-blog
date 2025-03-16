import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./plugins/remark-reading-time.mjs";
import tailwindcss from "@tailwindcss/vite";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeExternalLinks from "rehype-external-links";
import icon from "astro-icon";

import react from "@astrojs/react";

export default defineConfig({
  integrations: [icon(), react()],
  redirects: {
    "/": "/en",
  },
  output: "static",
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [
      rehypeKatex,

      [
        rehypePrettyCode,
        {
          theme: "vesper",
          keepBackground: true,
        },
      ],
      [
        rehypeExternalLinks,
        {
          content: { type: "text", value: "🔗" },
        },
      ],
    ],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt-br"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});