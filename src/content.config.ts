import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    icon: z.string().optional(),
    subtitle: z.string(),
    stack: z.string().optional(),
    date: z.date(),
    link: z.url(),
  }),
});

const homelab = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/homelab" }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { projects, homelab };
