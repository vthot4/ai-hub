import { defineMiddleware } from 'astro:middleware';
import { resolveUser } from './lib/auth';

export const onRequest = defineMiddleware((context, next) => {
  // Las páginas prerenderizadas no tienen petición real en build.
  if (!context.isPrerendered) context.locals.user = resolveUser(context.request.headers);
  return next();
});
