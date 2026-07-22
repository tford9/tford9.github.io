import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.string().or(z.date()),
    draft: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional(),
    // 'article' = long-form writing hosted here; 'note' = short blog post.
    kind: z.enum(['article', 'note']).optional().default('note'),
    // If set, the entry links to an external publication instead of a local page.
    link: z.string().url().optional(),
  }),
});

export const collections = { posts };
