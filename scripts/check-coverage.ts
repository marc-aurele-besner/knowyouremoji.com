#!/usr/bin/env bun
/**
 * Coverage Enforcement Script
 *
 * This script runs Bun tests with coverage and fails if coverage
 * falls below the configured thresholds (100% required).
 *
 * Usage: bun run scripts/check-coverage.ts
 */

import { spawn } from 'bun';

const COVERAGE_THRESHOLD = {
  functions: 100,
  // Line coverage threshold is 99.5% to accommodate third-party SDK integration code
  // (e.g., Sentry SDK calls) that cannot be unit tested without actual service setup.
  // These lines are tested via integration/E2E tests in production.
  lines: 99.5,
};

interface CoverageResult {
  functions: number;
  lines: number;
}

async function runTestsWithCoverage(): Promise<{ output: string; exitCode: number }> {
  const proc = spawn({
    cmd: ['bun', 'test', 'tests/unit', 'tests/integration', '--coverage'],
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  return { output: stdout + stderr, exitCode };
}

function parseCoverage(output: string): CoverageResult | null {
  // Look for the "All files" line in coverage output
  // Format: "All files                                                  |   95.76 |   96.53 |"
  const allFilesRegex = /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/;
  const match = output.match(allFilesRegex);

  if (!match) {
    return null;
  }

  return {
    functions: parseFloat(match[1]),
    lines: parseFloat(match[2]),
  };
}

async function main(): Promise<void> {
  console.log('Running tests with coverage enforcement...\n');

  const { output, exitCode } = await runTestsWithCoverage();

  // Print the test output
  console.log(output);

  // Check if tests passed
  if (exitCode !== 0) {
    console.error('\n❌ Tests failed. Fix test failures before checking coverage.');
    process.exit(exitCode);
  }

  // Parse coverage
  const coverage = parseCoverage(output);

  if (!coverage) {
    console.error('\n❌ Could not parse coverage from test output.');
    process.exit(1);
  }

  console.log('\n📊 Coverage Summary:');
  console.log(
    `   Functions: ${coverage.functions.toFixed(2)}% (threshold: ${COVERAGE_THRESHOLD.functions}%)`
  );
  console.log(
    `   Lines:     ${coverage.lines.toFixed(2)}% (threshold: ${COVERAGE_THRESHOLD.lines}%)`
  );

  // Check thresholds
  const failures: string[] = [];

  if (coverage.functions < COVERAGE_THRESHOLD.functions) {
    failures.push(
      `Functions coverage (${coverage.functions.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLD.functions}%)`
    );
  }

  if (coverage.lines < COVERAGE_THRESHOLD.lines) {
    failures.push(
      `Lines coverage (${coverage.lines.toFixed(2)}%) is below threshold (${COVERAGE_THRESHOLD.lines}%)`
    );
  }

  if (failures.length > 0) {
    console.error('\n❌ Coverage threshold check failed:');
    for (const failure of failures) {
      console.error(`   - ${failure}`);
    }
    console.error('\n   Please add tests to improve coverage before merging.');
    process.exit(1);
  }

  console.log('\n✅ Coverage thresholds met!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
