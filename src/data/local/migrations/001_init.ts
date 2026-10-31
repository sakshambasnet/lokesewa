import type { LocalMigration } from './types';

// Base tables. Feature tables (questions, attempts, outbox…) come in later migrations.
export const migration001Init: LocalMigration = {
  version: 1,
  name: 'init',
  sql: `
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `,
};
