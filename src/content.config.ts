import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.date(),
  draft: z.boolean(),
  tags: z.array(z.string()).optional(),
});

const enBlogCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!weekly/**", "!notes/**"],
    base: "./src/content/en",
  }),
  schema: blogSchema,
});

const ptBrBlogCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}", "!weekly/**", "!notes/**"],
    base: "./src/content/pt-br",
  }),
  schema: blogSchema,
});

const notesSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.date(),
  draft: z.boolean(),
  tags: z.array(z.string()).optional(),
});

const enNotesCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}"],
    base: "./src/content/en/notes",
  }),
  schema: notesSchema,
});

const ptBrNotesCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}"],
    base: "./src/content/pt-br/notes",
  }),
  schema: notesSchema,
});

const weeklySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.date(),
  draft: z.boolean(),
  tags: z.array(z.string()).optional(),
});

const enWeeklyCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}"],
    base: "./src/content/en/weekly",
  }),
  schema: weeklySchema,
});

const ptBrWeeklyCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.{md,mdx}"],
    base: "./src/content/pt-br/weekly",
  }),
  schema: weeklySchema,
});

export const collections = {
  "en-notes": enNotesCollection,
  "en-weekly": enWeeklyCollection,
  en: enBlogCollection,
  "pt-br": ptBrBlogCollection,
  "pt-br-notes": ptBrNotesCollection,
  "pt-br-weekly": ptBrWeeklyCollection,
};
