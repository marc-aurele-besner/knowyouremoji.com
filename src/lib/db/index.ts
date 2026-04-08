import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export type Database = NeonHttpDatabase<typeof schema>;

let db: Database | null = null;

/**
 * Get the Drizzle database instance for Neon Postgres.
 * Returns null if DATABASE_URL is not configured.
 */
export function getDb(): Database | null {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }

  if (!db) {
    const sql = neon(url);
    db = drizzle(sql, { schema });
  }

  return db;
}

/**
 * Check if the database is configured.
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0);
}

/**
 * Clear the cached database instance (for testing).
 */
export function clearDb(): void {
  db = null;
}
