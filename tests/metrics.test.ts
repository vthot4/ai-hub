import { beforeEach, describe, expect, it } from 'vitest';
import { openDb, type Db } from '../src/lib/db';
import { createMetrics, sectionOf, type Metrics } from '../src/lib/metrics';
import { createRepo } from '../src/lib/repo';

describe('sectionOf', () => {
  it('maps paths to tracked sections and ignores the rest', () => {
    expect(sectionOf('/')).toBe('home');
    expect(sectionOf('/tools/code-assistant/')).toBe('tools');
    expect(sectionOf('/challenges/')).toBe('challenges');
    expect(sectionOf('/api/challenges/')).toBeNull();
    expect(sectionOf('/home/')).toBeNull();
    expect(sectionOf('/whatever/')).toBeNull();
  });
});

describe('metrics', () => {
  let db: Db;
  let m: Metrics;
  const day = (s: string) => new Date(`${s}T12:00:00Z`);
  beforeEach(() => {
    db = openDb(':memory:');
    m = createMetrics(db);
  });

  it('counts distinct users and visits within the window, zero-filling empty days', () => {
    m.recordView('ana@example.org', '/tools/', day('2026-11-20'));
    m.recordView('ana@example.org', '/tools/x/', day('2026-11-20'));
    m.recordView('bob@example.org', '/faq/', day('2026-11-20'));
    m.recordView('ana@example.org', '/agents/', day('2026-11-22'));
    m.recordView('old@example.org', '/tools/', day('2026-09-01')); // fuera de ventana

    const s = m.summary(7, day('2026-11-24'));
    expect(s.activeUsers).toBe(2);
    expect(s.views).toBe(4);
    expect(s.bySection[0]).toEqual({ section: 'tools', views: 2 });
    expect(s.daily).toHaveLength(7);
    expect(s.daily.find((d) => d.day === '2026-11-20')?.users).toBe(2);
    expect(s.daily.find((d) => d.day === '2026-11-21')?.users).toBe(0);
  });

  it('rejects untracked paths and never stores the raw email', () => {
    expect(m.recordView('ana@example.org', '/api/x/')).toBe(false);
    m.recordView('ana@example.org', '/tools/');
    const stored = JSON.stringify(db.prepare('SELECT * FROM page_views').all());
    expect(stored).not.toContain('ana');
  });

  it('summarises challenge participation', () => {
    const repo = createRepo(db);
    const a = repo.create({ title: 'First', body: 'Long enough body', kind: 'feature', author: 'ana@example.org' });
    repo.create({ title: 'Second', body: 'Long enough body', kind: 'tool', author: 'bob@example.org' });
    repo.setStatus(a.id, 'done');
    repo.toggleVote(a.id, 'cris@example.org');
    repo.addComment(a.id, 'ana@example.org', 'hi');

    const c = m.summary(30).challenges;
    expect(c).toMatchObject({ total: 2, resolved: 1, votes: 1, comments: 1, participants: 3 });
    expect(c.byStatus.open).toBe(1);
  });
});
