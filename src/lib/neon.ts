/**
 * Neon (serverless Postgres) client — optional; used for emoji popularity when DATABASE_URL is set.
 */

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export type NeonSql = NeonQueryFunction<false, false>;

/**
 * Returns a Neon SQL template tag function, or null if DATABASE_URL is not configured.
 */
export function getNeonSql(): NeonSql | null {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  return neon(url) as NeonSql;
}
