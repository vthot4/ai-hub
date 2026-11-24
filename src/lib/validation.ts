import { z } from 'astro/zod';

import { kinds, statuses } from './constants';
import { checkRange, exceptionStatuses } from './exceptions';

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

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().startsWith(d), 'Invalid date');

export const createExceptionSchema = z
  .object({
    tool: z.string().trim().min(1).max(100),
    holder: text(2, 100),
    reason: text(10, 1000),
    startsOn: isoDate,
    expiresOn: isoDate,
  })
  .superRefine((v, ctx) => {
    const msg = checkRange(v.startsOn, v.expiresOn);
    if (msg) ctx.addIssue({ code: 'custom', path: ['expiresOn'], message: msg });
  });

export const exceptionActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('revoke') }),
  z.object({ action: z.literal('renew'), expiresOn: isoDate }),
]);

export const exceptionListQuerySchema = z.object({
  status: z.enum(exceptionStatuses as [string, ...string[]]).optional(),
  tool: z.string().trim().max(100).optional(),
});
