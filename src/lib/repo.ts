import type { Db } from './db';
import type { Kind, Status } from './constants';

export interface Challenge {
  id: number;
  title: string;
  body: string;
  kind: Kind;
  status: Status;
  author: string;
  createdAt: string;
  votes: number;
  comments: number;
  voted: boolean;
}
export interface Comment {
  id: number;
  challengeId: number;
  author: string;
  body: string;
  createdAt: string;
}
export interface ListOptions {
  user: string;
  status?: Status;
  kind?: Kind;
  sort?: 'votes' | 'new';
  q?: string;
}

interface ChallengeRow {
  id: number; title: string; body: string; kind: Kind; status: Status; author: string;
  created_at: string; votes: number; comments: number; voted: number;
}
const toChallenge = (r: ChallengeRow): Challenge => ({
  id: r.id, title: r.title, body: r.body, kind: r.kind, status: r.status, author: r.author,
  createdAt: r.created_at, votes: r.votes, comments: r.comments, voted: r.voted === 1,
});

const SELECT = `
  SELECT c.id, c.title, c.body, c.kind, c.status, c.author, c.created_at,
    (SELECT COUNT(*) FROM votes v WHERE v.challenge_id = c.id) AS votes,
    (SELECT COUNT(*) FROM comments m WHERE m.challenge_id = c.id) AS comments,
    EXISTS(SELECT 1 FROM votes v WHERE v.challenge_id = c.id AND v.user = @user) AS voted
  FROM challenges c`;

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (m) => `\\${m}`);

export function createRepo(db: Db) {
  const get = db.prepare(`${SELECT} WHERE c.id = @id`);
  const countVotes = db.prepare('SELECT COUNT(*) AS n FROM votes WHERE challenge_id = ?');

  return {
    list(o: ListOptions): Challenge[] {
      const where: string[] = [];
      const params: Record<string, unknown> = { user: o.user };
      if (o.status) { where.push('c.status = @status'); params.status = o.status; }
      if (o.kind) { where.push('c.kind = @kind'); params.kind = o.kind; }
      if (o.q) {
        where.push(`(c.title LIKE @q ESCAPE '\\' OR c.body LIKE @q ESCAPE '\\')`);
        params.q = `%${escapeLike(o.q)}%`;
      }
      const order = o.sort === 'new' ? 'c.created_at DESC, c.id DESC' : 'votes DESC, c.created_at DESC, c.id DESC';
      const sql = `${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${order}`;
      return (db.prepare(sql).all(params) as ChallengeRow[]).map(toChallenge);
    },

    get(id: number, user: string): Challenge | null {
      const r = get.get({ id, user }) as ChallengeRow | undefined;
      return r ? toChallenge(r) : null;
    },

    create(input: { title: string; body: string; kind: Kind; author: string }): Challenge {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO challenges (title, body, kind, author) VALUES (@title, @body, @kind, @author)')
        .run(input);
      return this.get(Number(lastInsertRowid), input.author)!;
    },

    /** Alterna el voto. Devuelve null si el reto no existe. */
    toggleVote(id: number, user: string): { voted: boolean; votes: number } | null {
      return db.transaction(() => {
        if (!db.prepare('SELECT 1 FROM challenges WHERE id = ?').get(id)) return null;
        const removed = db.prepare('DELETE FROM votes WHERE challenge_id = ? AND user = ?').run(id, user).changes;
        if (!removed) db.prepare('INSERT INTO votes (challenge_id, user) VALUES (?, ?)').run(id, user);
        return { voted: !removed, votes: (countVotes.get(id) as { n: number }).n };
      })();
    },

    listComments(challengeId: number): Comment[] {
      return db
        .prepare('SELECT id, challenge_id, author, body, created_at FROM comments WHERE challenge_id = ? ORDER BY id')
        .all(challengeId)
        .map((r: any) => ({ id: r.id, challengeId: r.challenge_id, author: r.author, body: r.body, createdAt: r.created_at }));
    },

    addComment(challengeId: number, author: string, body: string): Comment | null {
      if (!db.prepare('SELECT 1 FROM challenges WHERE id = ?').get(challengeId)) return null;
      const { lastInsertRowid } = db
        .prepare('INSERT INTO comments (challenge_id, author, body) VALUES (?, ?, ?)')
        .run(challengeId, author, body);
      const r = db
        .prepare('SELECT id, challenge_id, author, body, created_at FROM comments WHERE id = ?')
        .get(lastInsertRowid) as any;
      return { id: r.id, challengeId: r.challenge_id, author: r.author, body: r.body, createdAt: r.created_at };
    },

    recentComments(limit = 50): (Comment & { challengeTitle: string })[] {
      return db
        .prepare(
          `SELECT m.id, m.challenge_id, m.author, m.body, m.created_at, c.title
           FROM comments m JOIN challenges c ON c.id = m.challenge_id ORDER BY m.id DESC LIMIT ?`,
        )
        .all(limit)
        .map((r: any) => ({
          id: r.id, challengeId: r.challenge_id, author: r.author, body: r.body, createdAt: r.created_at, challengeTitle: r.title,
        }));
    },

    deleteComment: (id: number) => db.prepare('DELETE FROM comments WHERE id = ?').run(id).changes > 0,
    deleteChallenge: (id: number) => db.prepare('DELETE FROM challenges WHERE id = ?').run(id).changes > 0,
    setStatus: (id: number, status: Status) =>
      db.prepare('UPDATE challenges SET status = ? WHERE id = ?').run(status, id).changes > 0,
  };
}

export type Repo = ReturnType<typeof createRepo>;
