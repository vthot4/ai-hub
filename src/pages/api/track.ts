import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { fail, readJson } from '../../lib/api';
import { getDb } from '../../lib/db';
import { createMetrics } from '../../lib/metrics';
import { allow } from '../../lib/ratelimit';

export const prerender = false;

const schema = z.object({ path: z.string().startsWith('/').max(200) });

/** Registro de visita por sección (agregado: se guarda un hash del usuario, no el email). */
export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return new Response(null, { status: 204 });
  if (ctx.request.headers.get('x-requested-with') !== 'ai-hub') return fail(400, 'Missing X-Requested-With header');
  const body = await readJson(ctx.request, schema);
  if (!body.ok) return body.res;
  if (!allow(`track:${user.email}`, 240, 10 * 60_000)) return new Response(null, { status: 204 });
  createMetrics(getDb()).recordView(user.email, body.value.path);
  return new Response(null, { status: 204 });
};
