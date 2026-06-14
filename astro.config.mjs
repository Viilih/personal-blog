import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./plugins/remark-reading-time.mjs";
import { remarkModifiedTime } from "./plugins/remark-modified-time.mjs";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeExternalLinks from "rehype-external-links";

import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [mdx()],
  redirects: {
    "/": "/en",
  },
  output: "static",
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkReadingTime, remarkModifiedTime],
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
      prefixDefaultLocale: true,
    },
  },
});
