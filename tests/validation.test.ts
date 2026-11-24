import { describe, expect, it } from 'vitest';
import { allow, _reset } from '../src/lib/ratelimit';
import { createChallengeSchema } from '../src/lib/validation';

describe('createChallengeSchema', () => {
  it('trims and defaults the kind', () => {
    const r = createChallengeSchema.parse({ title: '  A good title  ', body: '  A long enough body  ' });
    expect(r).toEqual({ title: 'A good title', body: 'A long enough body', kind: 'feature' });
  });

  it('rejects short, oversized and unknown-kind input', () => {
    expect(createChallengeSchema.safeParse({ title: 'abc', body: 'long enough body' }).success).toBe(false);
    expect(createChallengeSchema.safeParse({ title: 'Valid title', body: 'x'.repeat(4001) }).success).toBe(false);
    expect(createChallengeSchema.safeParse({ title: 'Valid title', body: 'long enough body', kind: 'hack' }).success).toBe(false);
  });
});

describe('rate limiter', () => {
  it('blocks after max hits within the window and recovers after it', () => {
    _reset();
    expect(allow('k', 2, 1000, 0)).toBe(true);
    expect(allow('k', 2, 1000, 10)).toBe(true);
    expect(allow('k', 2, 1000, 20)).toBe(false);
    expect(allow('other', 2, 1000, 20)).toBe(true);
    expect(allow('k', 2, 1000, 1500)).toBe(true);
  });
});
