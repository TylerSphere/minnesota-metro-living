import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cities = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/cities' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    heroImage: z.string().optional(),
    description: z.string(),
    highlights: z.array(z.string()),
    marketMedianPrice: z.string().optional(),
    population: z.string().optional(),
    commuteToMpls: z.string().optional(),
    topSchools: z.array(z.string()).optional(),
    pembertonContact: z.object({
      agentName: z.string().optional(),
      phone: z.string().optional(),
      url: z.string().optional(),
    }).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    city: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Minnesota Metro Living'),
  }),
});

const geo = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/geo' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    city: z.string().optional(),
    tags: z.array(z.string()).default([]),
    question: z.string(),
    author: z.string().default('Minnesota Metro Living'),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    city: z.string().optional(),
    tags: z.array(z.string()).default([]),
    source: z.string().optional(),
  }),
});

export const collections = { cities, blog, geo, news };
