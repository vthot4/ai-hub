import { createHash, randomBytes } from 'node:crypto';
import type { Db } from './db';
import { statuses, type Status } from './constants';

/** Secciones que se miden. El resto de rutas (404, assets, api) se ignoran. */
export const trackedSections = [
  'home', 'start', 'tools', 'policies', 'agents', 'flows', 'library',
  'challenges', 'training', 'faq', 'news', 'risks', 'metrics',
] as const;
export type Section = (typeof trackedSections)[number];

export function sectionOf(path: string): Section | null {
  if (path === '/' || path === '') return 'home';
  const first = path.split('/')[1];
  return (trackedSections as readonly string[]).includes(first) && first !== 'home' ? (first as Section) : null;
}

const dayOf = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number, from: Date) => new Date(from.getTime() - n * 86_400_000);

export interface MetricsSummary {
  windowDays: number;
  activeUsers: number;
  views: number;
  bySection: { section: string; views: number }[];
  daily: { day: string; users: number }[];
  challenges: { total: number; byStatus: Record<Status, number>; votes: number; comments: number; participants: number; resolved: number };
}

export function createMetrics(db: Db) {
  const salt = (): string => {
    const row = db.prepare("SELECT value FROM meta WHERE key = 'salt'").get() as { value: string } | undefined;
    if (row) return row.value;
    const value = randomBytes(16).toString('hex');
    db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('salt', ?)").run(value);
    return (db.prepare("SELECT value FROM meta WHERE key = 'salt'").get() as { value: string }).value;
  };
  // Se guarda un hash con sal, nunca el email: sirve para contar usuarios distintos sin identificarlos.
  const userHash = (email: string) => createHash('sha256').update(`${salt()}:${email}`).digest('hex').slice(0, 16);

  return {
    /** Registra una visita. Devuelve false si la ruta no pertenece a una sección medida. */
    recordView(email: string, path: string, now = new Date()): boolean {
      const section = sectionOf(path);
      if (!section) return false;
      db.prepare(
        `INSERT INTO page_views (day, section, user, hits) VALUES (?, ?, ?, 1)
         ON CONFLICT (day, section, user) DO UPDATE SET hits = hits + 1`,
      ).run(dayOf(now), section, userHash(email));
      return true;
    },

    summary(windowDays = 30, now = new Date()): MetricsSummary {
      const since = dayOf(daysAgo(windowDays - 1, now));
      const one = <T,>(sql: string, ...args: unknown[]) => db.prepare(sql).get(...args) as T;

      const totals = one<{ users: number; views: number | null }>(
        'SELECT COUNT(DISTINCT user) AS users, SUM(hits) AS views FROM page_views WHERE day >= ?', since);
      const bySection = db
        .prepare('SELECT section, SUM(hits) AS views FROM page_views WHERE day >= ? GROUP BY section ORDER BY views DESC')
        .all(since) as { section: string; views: number }[];
      const perDay = new Map(
        (db.prepare('SELECT day, COUNT(DISTINCT user) AS users FROM page_views WHERE day >= ? GROUP BY day').all(since) as { day: string; users: number }[])
          .map((r) => [r.day, r.users]),
      );
      const daily = Array.from({ length: windowDays }, (_, i) => {
        const day = dayOf(daysAgo(windowDays - 1 - i, now));
        return { day, users: perDay.get(day) ?? 0 };
      });

      const byStatus = Object.fromEntries(statuses.map((s) => [s, 0])) as Record<Status, number>;
      for (const r of db.prepare('SELECT status, COUNT(*) AS n FROM challenges GROUP BY status').all() as { status: Status; n: number }[]) {
        byStatus[r.status] = r.n;
      }
      const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

      return {
        windowDays,
        activeUsers: totals.users,
        views: totals.views ?? 0,
        bySection,
        daily,
        challenges: {
          total,
          byStatus,
          resolved: byStatus.done,
          votes: one<{ n: number }>('SELECT COUNT(*) AS n FROM votes').n,
          comments: one<{ n: number }>('SELECT COUNT(*) AS n FROM comments').n,
          participants: one<{ n: number }>(
            `SELECT COUNT(*) AS n FROM (
               SELECT author AS u FROM challenges UNION SELECT user FROM votes UNION SELECT author FROM comments)`).n,
        },
      };
    },
  };
}
export type Metrics = ReturnType<typeof createMetrics>;
