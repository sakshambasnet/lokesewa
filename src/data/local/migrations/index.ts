import { migration001Init } from './001_init';
import type { LocalMigration } from './types';

/** All local migrations, in order. Never edit one that has shipped — add a new one. */
export const migrations: LocalMigration[] = [migration001Init];
