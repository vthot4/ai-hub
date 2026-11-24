import { beforeEach, describe, expect, it } from 'vitest';
import { openDb } from '../src/lib/db';
import { checkRange, createExceptionsRepo, type ExceptionsRepo } from '../src/lib/exceptions';
import { createExceptionSchema, exceptionActionSchema } from '../src/lib/validation';

let repo: ExceptionsRepo;
beforeEach(() => {
  repo = createExceptionsRepo(openDb(':memory:'));
});
const grant = (o: Partial<{ tool: string; holder: string; startsOn: string; expiresOn: string }> = {}) =>
  repo.create({ tool: 'local-models', holder: 'ana@example.org', reason: 'Needed for a benchmark', startsOn: '2026-11-01', expiresOn: '2026-12-01', approvedBy: 'boss@example.org', ...o }, '2026-11-24');

describe('status', () => {
  it('derives active, scheduled, expired and revoked from dates and revocation', () => {
    const today = '2026-11-24';
    const a = grant();
    const s = grant({ startsOn: '2026-12-10', expiresOn: '2027-01-10' });
    const e = grant({ startsOn: '2026-09-01', expiresOn: '2026-11-23' });
    const r = grant();
    repo.revoke(r.id, 'boss@example.org', today);

    const byId = Object.fromEntries(repo.list({}, today).map((x) => [x.id, x.status]));
    expect(byId).toEqual({ [a.id]: 'active', [s.id]: 'scheduled', [e.id]: 'expired', [r.id]: 'revoked' });
  });

  it('treats the expiry day itself as still active and reports days left', () => {
    const x = grant({ expiresOn: '2026-11-24' });
    expect(repo.get(x.id, '2026-11-24')).toMatchObject({ status: 'active', daysLeft: 0 });
    expect(repo.get(x.id, '2026-11-25')).toMatchObject({ status: 'expired', daysLeft: -1 });
  });
});

describe('list', () => {
  it('filters by holder and orders active first, soonest expiry first', () => {
    const late = grant({ expiresOn: '2026-12-30' });
    const soon = grant({ expiresOn: '2026-11-30' });
    grant({ holder: 'bob@example.org' });
    const order = repo.list({ holder: 'ana@example.org' }, '2026-11-24').map((x) => x.id);
    expect(order).toEqual([soon.id, late.id]);
  });
});

describe('renew and revoke', () => {
  it('renews within the allowed range, rejects out-of-range and revoked ones', () => {
    const x = grant();
    expect(repo.renew(x.id, '2027-01-15', '2026-11-24')).toMatchObject({ expiresOn: '2027-01-15' });
    expect(repo.renew(x.id, '2028-01-01')).toEqual({ error: expect.stringContaining('365') });
    expect(repo.renew(x.id, '2026-10-01')).toEqual({ error: expect.stringContaining('before') });
    repo.revoke(x.id, 'boss@example.org');
    expect(repo.renew(x.id, '2026-12-15')).toBe('revoked');
    expect(repo.renew(999, '2026-12-15')).toBeNull();
  });

  it('revoking twice keeps the first revoker', () => {
    const x = grant();
    repo.revoke(x.id, 'first@example.org');
    expect(repo.revoke(x.id, 'second@example.org')?.revokedBy).toBe('first@example.org');
  });

  it('counts active exceptions and those expiring within 30 days', () => {
    grant({ expiresOn: '2026-12-01' });
    grant({ expiresOn: '2027-06-01' });
    grant({ expiresOn: '2026-11-01' });
    expect(repo.counts('2026-11-24')).toEqual({ active: 2, expiringSoon: 1 });
  });
});

describe('validation', () => {
  const base = { tool: 'local-models', holder: 'ana@example.org', reason: 'A valid justification', startsOn: '2026-11-01', expiresOn: '2026-12-01' };
  it('accepts a valid exception and rejects bad ranges and dates', () => {
    expect(createExceptionSchema.safeParse(base).success).toBe(true);
    expect(createExceptionSchema.safeParse({ ...base, expiresOn: '2026-10-01' }).success).toBe(false);
    expect(createExceptionSchema.safeParse({ ...base, expiresOn: '2028-01-01' }).success).toBe(false);
    expect(createExceptionSchema.safeParse({ ...base, startsOn: '2026-02-30' }).success).toBe(false);
    expect(createExceptionSchema.safeParse({ ...base, reason: 'short' }).success).toBe(false);
  });
  it('requires an expiry date for renew', () => {
    expect(exceptionActionSchema.safeParse({ action: 'renew' }).success).toBe(false);
    expect(exceptionActionSchema.safeParse({ action: 'revoke' }).success).toBe(true);
    expect(checkRange('2026-01-01', '2026-01-01')).toBeNull();
  });
});
