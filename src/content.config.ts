import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
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

const flows = defineCollection({
  loader: md('flows'),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    icon: z.string().default('🔀'),
    kind: z.enum(['process', 'automation']),
    category: z.string(),
    owner: z.string(),
    version: z.string(),
    updatedOn: z.coerce.date(),
    // Solo para `automation`
    stack: z.array(z.string()).default([]),
    inputs: z.array(z.string()).default([]),
    outputs: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const onboarding = defineCollection({
  loader: md('onboarding'),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    icon: z.string().default('🚀'),
    role: z.string(),
    order: z.number().default(100),
    estimatedTime: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const faq = defineCollection({
  loader: md('faq'),
  schema: z.object({
    question: z.string(),
    category: z.string(),
    order: z.number().default(100),
  }),
});

const decisionNode = z.object({
  id: z.string(),
  question: z.string().optional(),
  options: z.array(z.object({ label: z.string(), next: z.string() })).default([]),
  result: z
    .object({
      verdict: z.enum(['yes', 'conditions', 'no']),
      title: z.string(),
      text: z.string(),
      links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    })
    .optional(),
});
const decision = defineCollection({
  loader: file('src/content/decision-tree.json'),
  schema: decisionNode,
});

const news = defineCollection({
  loader: md('news'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(['tool', 'policy', 'agent', 'library', 'hub']),
    summary: z.string().max(220),
    href: z.string().optional(),
  }),
});

const risks = defineCollection({
  loader: md('risks'),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    icon: z.string().default('⚠️'),
    date: z.coerce.date(),
    severity: z.enum(['low', 'medium', 'high']),
    status: z.enum(['open', 'mitigated', 'closed']),
    category: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const training = defineCollection({
  loader: md('training'),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    icon: z.string().default('🎓'),
    kind: z.enum(['course', 'workshop', 'path']),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    format: z.enum(['online', 'in-person', 'self-paced']),
    duration: z.string(),
    audience: z.string(),
    url: z.url().optional(),
    // Fechas (YYYY-MM-DD) de próximas ediciones; vacío = a demanda
    sessions: z.array(z.coerce.date()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { tools, policies, agents, library, flows, onboarding, faq, decision, news, risks, training };
