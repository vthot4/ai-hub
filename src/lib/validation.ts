import { z } from 'astro/zod';

import { kinds, statuses } from './constants';

const text = (min: number, max: number) => z.string().trim().min(min).max(max);

export const createChallengeSchema = z.object({
  title: text(5, 120),
  body: text(10, 4000),
  kind: z.enum(kinds).default('feature'),
});
export const commentSchema = z.object({ body: text(1, 1000) });
export const statusSchema = z.object({ status: z.enum(statuses) });
export const listQuerySchema = z.object({
  status: z.enum(statuses).optional(),
  kind: z.enum(kinds).optional(),
  sort: z.enum(['votes', 'new']).default('votes'),
  q: z.string().trim().max(100).optional(),
});
export const idSchema = z.coerce.number().int().positive();
