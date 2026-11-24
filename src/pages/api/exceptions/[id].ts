import type { APIRoute } from 'astro';
import { fail, json, readJson, requireUser } from '../../../lib/api';
import { getDb } from '../../../lib/db';
import { createExceptionsRepo } from '../../../lib/exceptions';
import { exceptionActionSchema, idSchema } from '../../../lib/validation';

export const prerender = false;

/** Admin: renovar (`{action:"renew", expiresOn}`) o revocar (`{action:"revoke"}`). */
export const PATCH: APIRoute = async (ctx) => {
  const u = requireUser(ctx, true);
  if (!u.ok) return u.res;
  const id = idSchema.safeParse(ctx.params.id);
  if (!id.success) return fail(400, 'Invalid id');
  const body = await readJson(ctx.request, exceptionActionSchema);
  if (!body.ok) return body.res;
  const repo = createExceptionsRepo(getDb());

  if (body.value.action === 'revoke') {
    const r = repo.revoke(id.data, u.value.email);
    return r ? json(200, r) : fail(404, 'Not found');
  }
  const r = repo.renew(id.data, body.value.expiresOn);
  if (r === null) return fail(404, 'Not found');
  if (r === 'revoked') return fail(409, 'A revoked exception cannot be renewed; grant a new one');
  if ('error' in r) return fail(400, 'Validation failed', { expiresOn: [r.error] });
  return json(200, r);
};
