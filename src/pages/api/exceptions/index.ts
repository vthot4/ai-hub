import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { fail, json, readJson, requireUser } from '../../../lib/api';
import { getDb } from '../../../lib/db';
import { createExceptionsRepo, type ExceptionStatus } from '../../../lib/exceptions';
import { getExceptionTools } from '../../../lib/restricted-tools';
import { createExceptionSchema, exceptionListQuerySchema } from '../../../lib/validation';

export const prerender = false;

/** Admin: todas. Usuario normal: solo las suyas. */
export const GET: APIRoute = (ctx) => {
  const u = requireUser(ctx);
  if (!u.ok) return u.res;
  const q = exceptionListQuerySchema.safeParse(Object.fromEntries(ctx.url.searchParams));
  if (!q.success) return fail(400, 'Invalid query', z.flattenError(q.error).fieldErrors);
  const rows = createExceptionsRepo(getDb()).list({
    tool: q.data.tool,
    status: q.data.status as ExceptionStatus | undefined,
    holder: u.value.isAdmin ? undefined : u.value.email,
  });
  return json(200, rows);
};

export const POST: APIRoute = async (ctx) => {
  const u = requireUser(ctx, true);
  if (!u.ok) return u.res;
  const body = await readJson(ctx.request, createExceptionSchema);
  if (!body.ok) return body.res;
  const tools = await getExceptionTools();
  if (!tools.some((t) => t.id === body.value.tool)) {
    return fail(400, 'Validation failed', { tool: ['Exceptions can only be granted for restricted tools'] });
  }
  return json(201, createExceptionsRepo(getDb()).create({ ...body.value, holder: body.value.holder.toLowerCase(), approvedBy: u.value.email }));
};
