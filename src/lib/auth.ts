import { env } from './env';

export interface User {
  email: string;
  isAdmin: boolean;
}

export interface AuthConfig {
  trustProxy: boolean;
  emailHeader: string;
  adminEmails: string[];
  allowDevUser: boolean;
  devEmail: string;
  devAdmin: boolean;
}

export function loadAuthConfig(): AuthConfig {
  return {
    trustProxy: env('TRUST_PROXY_AUTH') === 'true',
    emailHeader: (env('AUTH_EMAIL_HEADER') ?? 'x-forwarded-email').toLowerCase(),
    adminEmails: (env('ADMIN_EMAILS') ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
    allowDevUser: env('ALLOW_DEV_USER') === 'true',
    devEmail: (env('DEV_USER_EMAIL') ?? 'dev@example.org').toLowerCase(),
    devAdmin: env('DEV_USER_ADMIN') === 'true',
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+$/;

/**
 * Identidad del usuario:
 *  - TRUST_PROXY_AUTH=true  -> email de la cabecera inyectada por el proxy.
 *  - ALLOW_DEV_USER=true    -> usuario falso (solo desarrollo local).
 *  - en otro caso           -> null (anónimo, sin acceso).
 * La cabecera solo se lee si se confía explícitamente en el proxy.
 */
export function resolveUser(headers: Headers, cfg: AuthConfig = loadAuthConfig()): User | null {
  if (cfg.trustProxy) {
    const email = headers.get(cfg.emailHeader)?.trim().toLowerCase();
    if (!email || !EMAIL.test(email)) return null;
    return { email, isAdmin: cfg.adminEmails.includes(email) };
  }
  if (cfg.allowDevUser) return { email: cfg.devEmail, isAdmin: cfg.devAdmin || cfg.adminEmails.includes(cfg.devEmail) };
  return null;
}
