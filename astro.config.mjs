import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import { remarkReadingTime } from "./plugins/remark-reading-time.mjs";
import { remarkModifiedTime } from "./plugins/remark-modified-time.mjs";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeExternalLinks from "rehype-external-links";

import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://vilih.com",
  integrations: [mdx()],
  redirects: {
    "/": "/en",
  },
  output: "static",
  // Astro 7 defaults this to "jsx", which drops spaces between inline elements.
  compressHTML: true,
  markdown: {
    syntaxHighlight: false,
    processor: unified({
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
    }),
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt-br"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
