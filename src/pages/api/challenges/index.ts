import type { APIRoute } from 'astro';
import { allow } from '../../../lib/ratelimit';
import { fail, json, readJson, requireUser } from '../../../lib/api';
import { z } from 'astro/zod';
import { getDb } from '../../../lib/db';
import { createRepo } from '../../../lib/repo';
import { createChallengeSchema, listQuerySchema } from '../../../lib/validation';

export const prerender = false;

export const GET: APIRoute = (ctx) => {
  const u = requireUser(ctx);
  if (!u.ok) return u.res;
  const query = listQuerySchema.safeParse(Object.fromEntries(ctx.url.searchParams));
  if (!query.success) return fail(400, 'Invalid query', z.flattenError(query.error).fieldErrors);
  return json(200, createRepo(getDb()).list({ user: u.value.email, ...query.data }));
};

export const POST: APIRoute = async (ctx) => {
  const u = requireUser(ctx);
  if (!u.ok) return u.res;
  const body = await readJson(ctx.request, createChallengeSchema);
  if (!body.ok) return body.res;
  if (!allow(`create:${u.value.email}`, 5, 10 * 60_000)) return fail(429, 'Too many submissions, try again later');
  return json(201, createRepo(getDb()).create({ ...body.value, author: u.value.email }));
};
