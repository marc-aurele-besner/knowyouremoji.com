import { describe, it, expect } from 'bun:test';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getTableColumns, getTableName, is, Table } from 'drizzle-orm';
import * as schema from '../../../src/lib/db/schema';

const MIGRATIONS_DIR = join(process.cwd(), 'migrations');

/** Every .sql migration, sorted by its numeric prefix. */
function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

function allMigrationSql(): string {
  return migrationFiles()
    .map((file) => readFileSync(join(MIGRATIONS_DIR, file), 'utf-8'))
    .join('\n');
}

/**
 * Map each `CREATE TABLE` statement in the migrations to its column body, so
 * tests can assert the SQL covers what the Drizzle schema declares.
 */
function createdTableBodies(): Map<string, string> {
  const bodies = new Map<string, string>();
  const pattern = /CREATE TABLE (?:IF NOT EXISTS )?([a-z_]+)\s*\(([\s\S]*?)\n\);/gi;
  const sql = allMigrationSql();

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sql)) !== null) {
    bodies.set(match[1].toLowerCase(), match[2]);
  }

  return bodies;
}

/** All tables declared in src/lib/db/schema.ts. */
function schemaTables(): Table[] {
  return Object.values(schema).filter((value) => is(value, Table)) as Table[];
}

describe('database migrations', () => {
  it('should have a migrations directory', () => {
    expect(existsSync(MIGRATIONS_DIR)).toBe(true);
  });

  it('should name every migration <nnn>_<snake_case>.sql', () => {
    for (const file of migrationFiles()) {
      expect(file).toMatch(/^\d{3}_[a-z0-9_]+\.sql$/);
    }
  });

  it('should not reuse a migration number', () => {
    const numbers = migrationFiles().map((file) => file.slice(0, 3));
    expect(numbers.length).toBe(new Set(numbers).size);
  });

  it('should parse at least one CREATE TABLE statement', () => {
    expect(createdTableBodies().size).toBeGreaterThan(0);
  });

  // Regression guard: the subscriptions table existed in the Drizzle schema for
  // several releases with no migration to create it (issue #119).
  describe('schema parity', () => {
    const bodies = createdTableBodies();

    for (const table of schemaTables()) {
      const tableName = getTableName(table);

      it(`should create the ${tableName} table in a migration`, () => {
        expect(bodies.has(tableName)).toBe(true);
      });

      it(`should define every ${tableName} column in that migration`, () => {
        const body = bodies.get(tableName);
        expect(body).toBeDefined();

        const columns = Object.values(getTableColumns(table)).map((column) => column.name);
        for (const column of columns) {
          expect(body).toMatch(new RegExp(`\\b${column}\\b`));
        }
      });
    }
  });

  describe('006_create_subscriptions.sql', () => {
    const sql = readFileSync(join(MIGRATIONS_DIR, '006_create_subscriptions.sql'), 'utf-8');

    it('should cascade deletes from users', () => {
      expect(sql).toMatch(/user_id uuid NOT NULL REFERENCES users\(id\) ON DELETE CASCADE/);
    });

    it('should default new rows to the free plan', () => {
      expect(sql).toMatch(/status text NOT NULL DEFAULT 'free'/);
      expect(sql).toMatch(/plan text NOT NULL DEFAULT 'free'/);
    });

    it('should enforce one subscription row per user', () => {
      expect(sql).toMatch(/CREATE UNIQUE INDEX IF NOT EXISTS \S+ ON subscriptions\(user_id\)/);
    });

    it('should enforce one row per Stripe subscription', () => {
      expect(sql).toMatch(
        /CREATE UNIQUE INDEX IF NOT EXISTS[\s\S]*?ON subscriptions\(stripe_subscription_id\)/
      );
    });

    it('should keep updated_at current with a trigger', () => {
      expect(sql).toMatch(/CREATE TRIGGER subscriptions_updated_at/);
      expect(sql).toMatch(/EXECUTE FUNCTION update_updated_at\(\)/);
    });

    it('should be re-runnable', () => {
      expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS subscriptions/);
      expect(sql).toMatch(/DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions/);
    });
  });
});
