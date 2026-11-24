import type { Db } from './db';

export type ExceptionStatus = 'active' | 'scheduled' | 'expired' | 'revoked';
export const exceptionStatuses: ExceptionStatus[] = ['active', 'scheduled', 'expired', 'revoked'];
export const MAX_EXCEPTION_DAYS = 365;
export const EXPIRING_SOON_DAYS = 30;

export interface Exception {
  id: number;
  tool: string;
  holder: string;
  reason: string;
  approvedBy: string;
  startsOn: string;
  expiresOn: string;
  revokedAt: string | null;
  revokedBy: string | null;
  createdAt: string;
  status: ExceptionStatus;
  /** Días hasta la caducidad (negativo si ya caducó). Solo informativo para excepciones no revocadas. */
  daysLeft: number;
}

interface Row {
  id: number; tool: string; holder: string; reason: string; approved_by: string; starts_on: string;
  expires_on: string; revoked_at: string | null; revoked_by: string | null; created_at: string;
}

export const todayUtc = (now = new Date()) => now.toISOString().slice(0, 10);
const dayDiff = (a: string, b: string) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);

export function statusOf(r: { starts_on: string; expires_on: string; revoked_at: string | null }, today: string): ExceptionStatus {
  if (r.revoked_at) return 'revoked';
  if (r.expires_on < today) return 'expired';
  if (r.starts_on > today) return 'scheduled';
  return 'active';
}

/** Valida y devuelve un mensaje de error, o null si el rango de fechas es válido. */
export function checkRange(startsOn: string, expiresOn: string): string | null {
  if (expiresOn < startsOn) return 'Expiry date must not be before the start date';
  if (dayDiff(expiresOn, startsOn) > MAX_EXCEPTION_DAYS) return `An exception cannot last more than ${MAX_EXCEPTION_DAYS} days`;
  return null;
}

export function createExceptionsRepo(db: Db) {
  const toException = (r: Row, today: string): Exception => ({
    id: r.id, tool: r.tool, holder: r.holder, reason: r.reason, approvedBy: r.approved_by,
    startsOn: r.starts_on, expiresOn: r.expires_on, revokedAt: r.revoked_at, revokedBy: r.revoked_by,
    createdAt: r.created_at, status: statusOf(r, today), daysLeft: dayDiff(r.expires_on, today),
  });
  const getRow = db.prepare('SELECT * FROM exceptions WHERE id = ?');

  return {
    create(input: { tool: string; holder: string; reason: string; startsOn: string; expiresOn: string; approvedBy: string }, today = todayUtc()): Exception {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO exceptions (tool, holder, reason, approved_by, starts_on, expires_on) VALUES (@tool, @holder, @reason, @approvedBy, @startsOn, @expiresOn)')
        .run(input);
      return toException(getRow.get(lastInsertRowid) as Row, today);
    },

    get: (id: number, today = todayUtc()): Exception | null => {
      const r = getRow.get(id) as Row | undefined;
      return r ? toException(r, today) : null;
    },

    /** Más próximas a caducar primero dentro de las vigentes; luego el resto por fecha de caducidad descendente. */
    list(o: { holder?: string; tool?: string; status?: ExceptionStatus } = {}, today = todayUtc()): Exception[] {
      const where: string[] = [];
      const params: Record<string, unknown> = {};
      if (o.holder) { where.push('holder = @holder'); params.holder = o.holder; }
      if (o.tool) { where.push('tool = @tool'); params.tool = o.tool; }
      const rows = db.prepare(`SELECT * FROM exceptions ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`).all(params) as Row[];
      const rank: Record<ExceptionStatus, number> = { active: 0, scheduled: 1, expired: 2, revoked: 3 };
      return rows
        .map((r) => toException(r, today))
        .filter((e) => !o.status || e.status === o.status)
        .sort((a, b) =>
          rank[a.status] - rank[b.status] ||
          (a.status === 'active' || a.status === 'scheduled' ? a.expiresOn.localeCompare(b.expiresOn) : b.expiresOn.localeCompare(a.expiresOn)) ||
          b.id - a.id);
    },

    /** Cambia la fecha de caducidad. null = no existe; 'revoked' = no se puede renovar; string = error de rango. */
    renew(id: number, expiresOn: string, today = todayUtc()): Exception | 'revoked' | { error: string } | null {
      const r = getRow.get(id) as Row | undefined;
      if (!r) return null;
      if (r.revoked_at) return 'revoked';
      const error = checkRange(r.starts_on, expiresOn);
      if (error) return { error };
      db.prepare('UPDATE exceptions SET expires_on = ? WHERE id = ?').run(expiresOn, id);
      return toException(getRow.get(id) as Row, today);
    },

    /** Idempotente: revocar una ya revocada conserva la primera fecha/autor. */
    revoke(id: number, by: string, today = todayUtc()): Exception | null {
      if (!getRow.get(id)) return null;
      db.prepare("UPDATE exceptions SET revoked_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'), revoked_by = ? WHERE id = ? AND revoked_at IS NULL").run(by, id);
      return toException(getRow.get(id) as Row, today);
    },

    counts(today = todayUtc()): { active: number; expiringSoon: number } {
      const all = this.list({}, today);
      const active = all.filter((e) => e.status === 'active');
      return { active: active.length, expiringSoon: active.filter((e) => e.daysLeft <= EXPIRING_SOON_DAYS).length };
    },
  };
}
export type ExceptionsRepo = ReturnType<typeof createExceptionsRepo>;
