import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from './env';
import { migrations } from './migrations';

export type Db = Database.Database;

export function migrate(db: Db): void {
  const current = db.pragma('user_version', { simple: true }) as number;
  for (let v = current; v < migrations.length; v++) {
    db.transaction(() => {
      db.exec(migrations[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}

export function openDb(path: string): Db {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

const g = globalThis as unknown as { __hubDb?: Db };

/** Conexión única por proceso (sobrevive a recargas de módulos en dev). */
export function getDb(): Db {
  return (g.__hubDb ??= openDb(env('DATABASE_PATH') ?? './data/hub.db'));
}
