import { describe, expect, it, beforeEach } from 'vitest';
import { openDb, type Db } from '../src/lib/db';
import { createRepo, type Repo } from '../src/lib/repo';

let db: Db;
let repo: Repo;
beforeEach(() => {
  db = openDb(':memory:');
  repo = createRepo(db);
});

const make = (title: string, author = 'ana@example.org') =>
  repo.create({ title, body: 'Body of the challenge', kind: 'feature', author });

describe('votes', () => {
  it('toggles a single vote per user', () => {
    const c = make('First challenge');
    expect(repo.toggleVote(c.id, 'ana@example.org')).toEqual({ voted: true, votes: 1 });
    expect(repo.toggleVote(c.id, 'bob@example.org')).toEqual({ voted: true, votes: 2 });
    expect(repo.toggleVote(c.id, 'ana@example.org')).toEqual({ voted: false, votes: 1 });
  });

  it('returns null for a missing challenge', () => {
    expect(repo.toggleVote(999, 'ana@example.org')).toBeNull();
  });

  it('reports whether the requesting user has voted', () => {
    const c = make('First challenge');
    repo.toggleVote(c.id, 'ana@example.org');
    expect(repo.get(c.id, 'ana@example.org')?.voted).toBe(true);
    expect(repo.get(c.id, 'bob@example.org')?.voted).toBe(false);
  });
});

describe('list', () => {
  it('sorts by votes then recency, and filters by status and text', () => {
    const a = make('Alpha request');
    const b = make('Beta request');
    repo.toggleVote(b.id, 'ana@example.org');
    repo.setStatus(a.id, 'planned');

    expect(repo.list({ user: 'x@example.org', sort: 'votes' }).map((c) => c.title)).toEqual(['Beta request', 'Alpha request']);
    expect(repo.list({ user: 'x@example.org', status: 'planned' }).map((c) => c.title)).toEqual(['Alpha request']);
    expect(repo.list({ user: 'x@example.org', q: 'beta' }).map((c) => c.title)).toEqual(['Beta request']);
  });

  it('treats % and _ in the search text literally', () => {
    make('Rate 100% faster');
    make('Something else');
    expect(repo.list({ user: 'x@example.org', q: '100%' })).toHaveLength(1);
    expect(repo.list({ user: 'x@example.org', q: '%' })).toHaveLength(1);
  });
});

describe('comments and deletion', () => {
  it('counts comments and cascades on delete', () => {
    const c = make('With comments');
    repo.toggleVote(c.id, 'ana@example.org');
    const m = repo.addComment(c.id, 'bob@example.org', 'Nice idea')!;
    expect(repo.get(c.id, 'x')?.comments).toBe(1);
    expect(repo.addComment(999, 'bob@example.org', 'orphan')).toBeNull();

    expect(repo.deleteComment(m.id)).toBe(true);
    expect(repo.deleteChallenge(c.id)).toBe(true);
    expect(db.prepare('SELECT COUNT(*) n FROM votes').get()).toEqual({ n: 0 });
  });

  it('rejects an invalid status at the database level', () => {
    const c = make('Bad status');
    expect(() => db.prepare("UPDATE challenges SET status = 'bogus' WHERE id = ?").run(c.id)).toThrow();
  });
});
