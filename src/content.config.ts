import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const md = (dir: string) => glob({ pattern: '**/*.md', base: `./src/content/${dir}` });

export const toolStatus = z.enum(['approved', 'restricted', 'prohibited']);
export const agentStatus = z.enum(['stable', 'beta', 'experimental', 'deprecated']);

const tools = defineCollection({
  loader: md('tools'),
  schema: z.object({
    name: z.string(),
    summary: z.string().max(200),
    icon: z.string().default('🛠️'),
    status: toolStatus,
    category: z.string(),
    vendor: z.string(),
    url: z.url().optional(),
    owner: z.string(),
    reviewedOn: z.coerce.date(),
    requiresApproval: z.boolean().default(false),
    allowedUses: z.array(z.string()).default([]),
    forbiddenData: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const policies = defineCollection({
  loader: md('policies'),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    icon: z.string().default('📜'),
    category: z.string(),
    version: z.string(),
    effectiveFrom: z.coerce.date(),
    owner: z.string(),
    order: z.number().default(100),
    tags: z.array(z.string()).default([]),
  }),
});

const agents = defineCollection({
  loader: md('agents'),
  schema: z.object({
    name: z.string(),
    summary: z.string().max(200),
    icon: z.string().default('🤖'),
    status: agentStatus,
    category: z.string(),
    tech: z.array(z.string()).default([]),
    version: z.string(),
    owner: z.string(),
    repo: z.url().optional(),
    updatedOn: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

const library = defineCollection({
  loader: md('library'),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    icon: z.string().default('📚'),
    type: z.enum(['guide', 'best-practice', 'template', 'reference']),
    category: z.string(),
    author: z.string(),
    publishedOn: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { tools, policies, agents, library };
