import type { APIRoute } from 'astro';
import { fail, json, readJson, requireUser } from '../../../../lib/api';
import { getDb } from '../../../../lib/db';
import { createRepo } from '../../../../lib/repo';
import { allow } from '../../../../lib/ratelimit';
import { commentSchema, idSchema } from '../../../../lib/validation';

export const prerender = false;

export const GET: APIRoute = (ctx) => {
  const u = requireUser(ctx);
  if (!u.ok) return u.res;
  const id = idSchema.safeParse(ctx.params.id);
  if (!id.success) return fail(400, 'Invalid id');
  return json(200, createRepo(getDb()).listComments(id.data));
};

export const POST: APIRoute = async (ctx) => {
  const u = requireUser(ctx);
  if (!u.ok) return u.res;
  const id = idSchema.safeParse(ctx.params.id);
  if (!id.success) return fail(400, 'Invalid id');
  const body = await readJson(ctx.request, commentSchema);
  if (!body.ok) return body.res;
  if (!allow(`comment:${u.value.email}`, 20, 10 * 60_000)) return fail(429, 'Too many comments, try again later');
  const c = createRepo(getDb()).addComment(id.data, u.value.email, body.value.body);
  return c ? json(201, c) : fail(404, 'Not found');
};
