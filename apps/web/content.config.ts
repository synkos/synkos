import { defineCollection, defineContentConfig, z } from '@nuxt/content';

const docsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  navTitle: z.string().optional(),
  order: z.number().optional(),
});

const blogSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export default defineContentConfig({
  collections: {
    en_docs: defineCollection({
      type: 'page',
      source: 'en/docs/**/*.md',
      schema: docsSchema,
    }),
    es_docs: defineCollection({
      type: 'page',
      source: 'es/docs/**/*.md',
      schema: docsSchema,
    }),
    en_blog: defineCollection({
      type: 'page',
      source: 'en/blog/**/*.md',
      schema: blogSchema,
    }),
    es_blog: defineCollection({
      type: 'page',
      source: 'es/blog/**/*.md',
      schema: blogSchema,
    }),
  },
});
