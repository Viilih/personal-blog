import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const enBlogCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!weekly/**", "!notes/**"],
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
    pattern: ["**/*.{md,mdx}", "!weekly/**", "!notes/**"],
    base: "./src/content/pt-br",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    draft: z.boolean(),
  }),
});

const enNotesCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}"],
    base: "./src/content/en/notes",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    draft: z.boolean(),
  }),
});

const ptBrNotesCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}"],
    base: "./src/content/pt-br/notes",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    draft: z.boolean(),
  }),
});

const enWeeklyCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}"],
    base: "./src/content/en/weekly",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    draft: z.boolean(),
  }),
});

const ptBrWeeklyCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}"],
    base: "./src/content/pt-br/weekly",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    draft: z.boolean(),
  }),
});

export const collections = {
  "en-notes": enNotesCollection,
  "en-weekly": enWeeklyCollection,
  en: enBlogCollection,
  "pt-br": ptBrBlogCollection,
  "pt-br-notes": ptBrNotesCollection,
  "pt-br-weekly": ptBrWeeklyCollection,
};
