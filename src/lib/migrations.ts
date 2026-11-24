// Migraciones incrementales. La versión se guarda en `PRAGMA user_version`.
// Nunca modifiques una migración ya publicada: añade una nueva al final.
export const migrations: string[] = [
  /* 1 */ `
  CREATE TABLE challenges (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL,
    kind       TEXT NOT NULL DEFAULT 'feature' CHECK (kind IN ('feature','tool','agent','resource')),
    status     TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','planned','in-progress','done','declined')),
    author     TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE TABLE votes (
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user         TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    PRIMARY KEY (challenge_id, user)
  );
  CREATE TABLE comments (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    author       TEXT NOT NULL,
    body         TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  CREATE INDEX idx_comments_challenge ON comments(challenge_id);
  CREATE INDEX idx_challenges_status ON challenges(status);
  `,
];
