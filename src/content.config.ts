import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const enBlogCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!weekly/**"],
    base: "./src/content/en",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    draft: z.boolean(),
  }),
});

const ptBrBlogCollection = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/pt-br",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    draft: z.boolean(),
  }),
});

export const collections = {
  en: enBlogCollection,
  "pt-br": ptBrBlogCollection,
};
