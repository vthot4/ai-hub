import { describe, expect, it } from 'vitest';
import { resolveUser, type AuthConfig } from '../src/lib/auth';

const base: AuthConfig = {
  trustProxy: false,
  emailHeader: 'x-forwarded-email',
  adminEmails: ['boss@example.org'],
  allowDevUser: false,
  devEmail: 'dev@example.org',
  devAdmin: false,
};
const h = (email?: string) => new Headers(email ? { 'x-forwarded-email': email } : {});

describe('resolveUser', () => {
  it('ignores the identity header unless the proxy is trusted', () => {
    expect(resolveUser(h('boss@example.org'), base)).toBeNull();
  });

  it('reads and normalises the header when the proxy is trusted', () => {
    expect(resolveUser(h(' Ana@Example.org '), { ...base, trustProxy: true })).toEqual({ email: 'ana@example.org', isAdmin: false });
  });

  it('grants admin only to listed emails', () => {
    expect(resolveUser(h('BOSS@example.org'), { ...base, trustProxy: true })?.isAdmin).toBe(true);
  });

  it('rejects a missing or malformed header', () => {
    const cfg = { ...base, trustProxy: true };
    expect(resolveUser(h(), cfg)).toBeNull();
    expect(resolveUser(h('not-an-email'), cfg)).toBeNull();
  });

  it('only uses the dev user when explicitly allowed', () => {
    expect(resolveUser(h(), base)).toBeNull();
    expect(resolveUser(h(), { ...base, allowDevUser: true })).toEqual({ email: 'dev@example.org', isAdmin: false });
  });
});
