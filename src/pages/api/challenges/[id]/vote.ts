import type { APIRoute } from 'astro';
import { fail, json, requireUser } from '../../../../lib/api';
import { getDb } from '../../../../lib/db';
import { createRepo } from '../../../../lib/repo';
import { allow } from '../../../../lib/ratelimit';
import { idSchema } from '../../../../lib/validation';

export const prerender = false;

/** Alterna el voto del usuario. Sin cuerpo: se identifica por cabecera, así que CSRF se evita exigiendo un header propio. */
export const POST: APIRoute = (ctx) => {
  const u = requireUser(ctx);
  if (!u.ok) return u.res;
  if (ctx.request.headers.get('x-requested-with') !== 'ai-hub') return fail(400, 'Missing X-Requested-With header');
  const id = idSchema.safeParse(ctx.params.id);
  if (!id.success) return fail(400, 'Invalid id');
  if (!allow(`vote:${u.value.email}`, 60, 10 * 60_000)) return fail(429, 'Too many requests');
  const res = createRepo(getDb()).toggleVote(id.data, u.value.email);
  return res ? json(200, res) : fail(404, 'Not found');
};
