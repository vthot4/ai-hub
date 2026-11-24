import type { APIRoute } from 'astro';
import { fail, json, readJson, requireUser } from '../../../../lib/api';
import { getDb } from '../../../../lib/db';
import { createRepo } from '../../../../lib/repo';
import { idSchema, statusSchema } from '../../../../lib/validation';

export const prerender = false;

export const PATCH: APIRoute = async (ctx) => {
  const u = requireUser(ctx, true);
  if (!u.ok) return u.res;
  const id = idSchema.safeParse(ctx.params.id);
  if (!id.success) return fail(400, 'Invalid id');
  const body = await readJson(ctx.request, statusSchema);
  if (!body.ok) return body.res;
  const repo = createRepo(getDb());
  if (!repo.setStatus(id.data, body.value.status)) return fail(404, 'Not found');
  return json(200, repo.get(id.data, u.value.email));
};

export const DELETE: APIRoute = (ctx) => {
  const u = requireUser(ctx, true);
  if (!u.ok) return u.res;
  const id = idSchema.safeParse(ctx.params.id);
  if (!id.success) return fail(400, 'Invalid id');
  return createRepo(getDb()).deleteChallenge(id.data) ? json(200, { ok: true }) : fail(404, 'Not found');
};
