// @ts-check
import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./plugins/remark-reading-time.mjs";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";

// https://astro.build/config
export default defineConfig({
  output: "static",
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [
      rehypeKatex,
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          keepBackground: true,
        },
      ],
    ],
  },
});
