import type { APIContext } from 'astro';
import { z } from 'astro/zod';
import type { User } from './auth';

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export const fail = (status: number, error: string, details?: unknown) => json(status, { error, details });

type Guard<T> = { ok: true; value: T } | { ok: false; res: Response };

export function requireUser(ctx: APIContext, admin = false): Guard<User> {
  const user = ctx.locals.user;
  if (!user) return { ok: false, res: fail(401, 'Authentication required') };
  if (admin && !user.isAdmin) return { ok: false, res: fail(403, 'Admin role required') };
  return { ok: true, value: user };
}

/**
 * Lee un cuerpo JSON. Exigir `application/json` obliga a los navegadores a hacer preflight CORS
 * en peticiones cross-site, que es la defensa CSRF de esta API.
 */
export async function readJson<S extends z.ZodType>(request: Request, schema: S): Promise<Guard<z.output<S>>> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return { ok: false, res: fail(415, 'Content-Type must be application/json') };
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, res: fail(400, 'Invalid JSON') };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, res: fail(400, 'Validation failed', z.flattenError(parsed.error).fieldErrors) };
  return { ok: true, value: parsed.data };
}
