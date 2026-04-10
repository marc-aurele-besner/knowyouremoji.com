#!/usr/bin/env bun
/**
 * Neon Postgres Database Backup Script
 *
 * Creates a full SQL dump of the Neon Postgres database.
 * This script should be run periodically and the backups stored securely.
 *
 * Usage: bun run scripts/backup-neon.ts
 *
 * For automated backups, use the GitHub Actions workflow at:
 * .github/workflows/backup.yml
 *
 * Note: Neon provides automatic Point-in-Time Recovery (PITR).
 * This script is for creating manual backups before major changes
 * or for exporting data to another system.
 */

import { spawn } from 'bun';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'backups');

// ============================================
// CONFIGURATION
// ============================================

interface BackupConfig {
  databaseUrl: string;
  outputPath: string;
  timestamp: string;
}

function getConfig(): BackupConfig {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('   Set it in your .env.local or environment');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(OUTPUT_DIR, `neon-backup-${timestamp}.sql`);

  return { databaseUrl, outputPath, timestamp };
}

// ============================================
// BACKUP FUNCTIONS
// ============================================

/**
 * Run pg_dump to create the backup
 */
async function runPgDump(databaseUrl: string, outputPath: string): Promise<boolean> {
  console.log('📦 Running pg_dump backup...\n');

  try {
    const child = spawn({
      cmd: [
        'pg_dump',
        databaseUrl,
        '--file',
        outputPath,
        '--format',
        'plain',
        '--no-owner',
        '--no-acl',
      ],
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const exitCode = await child.exited;

    if (exitCode !== 0) {
      const stderr = await new Response(child.stderr).text();
      console.error('❌ pg_dump failed with exit code:', exitCode);
      console.error('   stderr:', stderr);
      return false;
    }

    return true;
  } catch (error) {
    // pg_dump might not be installed
    console.error('❌ pg_dump is not installed or failed to run');
    console.error('   Install postgresql-client: brew install postgresql (macOS)');
    console.error('   Or: apt-get install postgresql-client (Ubuntu/Debian)');
    console.error('   Error:', error);
    return false;
  }
}

/**
 * Create a simple SQL dump using raw SQL queries
 * This is a fallback when pg_dump is not available
 */
async function createSqlDump(outputPath: string): Promise<void> {
  console.log('📝 Creating SQL dump using raw queries (fallback)...\n');

  // Import neon here to avoid issues if DATABASE_URL is not set
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL!);

  const tables = [
    'users',
    'accounts',
    'sessions',
    'verification_tokens',
    'interpretations',
    'subscriptions',
    'emoji_page_views',
    'profiles',
    'emojis',
    'emoji_context_meanings',
    'emoji_platform_notes',
    'emoji_generational_notes',
    'combos',
    'combo_emojis',
    'combo_context_meanings',
    'combo_platform_notes',
    'combo_generational_notes',
  ];

  let dump = '-- ============================================\n';
  dump += '-- Neon Postgres Database Backup\n';
  dump += `-- Created: ${new Date().toISOString()}\n`;
  dump += '-- ============================================\n\n';

  for (const table of tables) {
    try {
      console.log(`   Dumping table: ${table}...`);
      // Use raw SQL to query table dynamically - safe since table names are from our own schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (await sql`SELECT * FROM "${table}"`) as any[];

      if (rows.length > 0) {
        dump += `-- ----------------------------------------\n`;
        dump += `-- Table: ${table} (${rows.length} rows)\n`;
        dump += `-- ----------------------------------------\n`;
        dump += `TRUNCATE TABLE ${table} CASCADE;\n\n`;

        for (const row of rows as Record<string, unknown>[]) {
          const columns = Object.keys(row);
          const values = Object.values(row).map((v) => {
            if (v === null) return 'NULL';
            if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
            if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
            return String(v);
          });

          dump += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        dump += '\n';
      }
    } catch (error) {
      console.warn(`   ⚠️  Could not dump table ${table}: ${error}`);
    }
  }

  fs.writeFileSync(outputPath, dump, 'utf-8');
}

/**
 * Get backup file size in human readable format
 */
function getFileSize(filePath: string): string {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// ============================================
// MAIN
// ============================================

async function main(): Promise<void> {
  console.log('🚀 Neon Postgres Database Backup\n');
  console.log('='.repeat(50) + '\n');

  const config = getConfig();

  console.log('📁 Output file:', config.outputPath);
  console.log('🕐 Timestamp:', config.timestamp, '\n');

  // Try pg_dump first
  const pgDumpSuccess = await runPgDump(config.databaseUrl, config.outputPath);

  if (!pgDumpSuccess) {
    // Fallback to SQL dump
    console.log('\n⚠️  Falling back to SQL dump...\n');
    await createSqlDump(config.outputPath);
  }

  // Verify backup was created
  if (fs.existsSync(config.outputPath)) {
    const size = getFileSize(config.outputPath);
    console.log('\n' + '='.repeat(50));
    console.log('✅ Backup completed successfully!');
    console.log('📁 File:', config.outputPath);
    console.log('📊 Size:', size);
    console.log('\n💡 Next steps:');
    console.log('   - Upload to cloud storage (S3, GCS, etc.)');
    console.log('   - Store in a secure backup location');
    console.log('   - Use for restore testing');
  } else {
    console.error('\n❌ Backup failed - no output file created');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Backup script failed:', error);
  process.exit(1);
});
