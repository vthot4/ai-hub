import type { APIRoute } from 'astro';
import { fail, json, requireUser } from '../../../lib/api';
import { getDb } from '../../../lib/db';
import { createRepo } from '../../../lib/repo';
import { idSchema } from '../../../lib/validation';

export const prerender = false;

export const DELETE: APIRoute = (ctx) => {
  const u = requireUser(ctx, true);
  if (!u.ok) return u.res;
  const id = idSchema.safeParse(ctx.params.id);
  if (!id.success) return fail(400, 'Invalid id');
  return createRepo(getDb()).deleteComment(id.data) ? json(200, { ok: true }) : fail(404, 'Not found');
};
