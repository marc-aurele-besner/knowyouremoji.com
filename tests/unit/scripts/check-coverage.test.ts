import { describe, it, expect } from 'bun:test';

// Import the script functions
// Note: We need to refactor the script to export testable functions
// For now, we'll test the coverage parsing logic directly

// Mock coverage output samples
const PASSING_COVERAGE_OUTPUT = `
bun test v1.3.6 (d530ed99)

-----------------------------------------------------------|---------|---------|-------------------
File                                                       | % Funcs | % Lines | Uncovered Line #s
-----------------------------------------------------------|---------|---------|-------------------
All files                                                  |  100.00 |  100.00 |
 src/lib/utils.ts                                          |  100.00 |  100.00 |
 tests/setup.ts                                            |  100.00 |  100.00 |
-----------------------------------------------------------|---------|---------|-------------------

 8 pass
 0 fail
 8 expect() calls
Ran 8 tests across 1 file. [251.00ms]
`;

const FAILING_COVERAGE_OUTPUT = `
bun test v1.3.6 (d530ed99)

-----------------------------------------------------------|---------|---------|-------------------
File                                                       | % Funcs | % Lines | Uncovered Line #s
-----------------------------------------------------------|---------|---------|-------------------
All files                                                  |   95.76 |   96.53 |
 src/lib/utils.ts                                          |  100.00 |  100.00 |
 src/lib/env.ts                                            |   20.00 |   50.00 | 45-53,60,67
-----------------------------------------------------------|---------|---------|-------------------

 1795 pass
 0 fail
 3098 expect() calls
Ran 1795 tests across 83 files. [18.96s]
`;

const NO_COVERAGE_OUTPUT = `
bun test v1.3.6 (d530ed99)

 8 pass
 0 fail
 8 expect() calls
Ran 8 tests across 1 file. [251.00ms]
`;

// Coverage parsing function (same as in the script)
function parseCoverage(output: string): { functions: number; lines: number } | null {
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

// Coverage threshold checking function
function checkThresholds(
  coverage: { functions: number; lines: number },
  thresholds: { functions: number; lines: number }
): string[] {
  const failures: string[] = [];

  if (coverage.functions < thresholds.functions) {
    failures.push(
      `Functions coverage (${coverage.functions.toFixed(2)}%) is below threshold (${thresholds.functions}%)`
    );
  }

  if (coverage.lines < thresholds.lines) {
    failures.push(
      `Lines coverage (${coverage.lines.toFixed(2)}%) is below threshold (${thresholds.lines}%)`
    );
  }

  return failures;
}

describe('check-coverage', () => {
  describe('parseCoverage', () => {
    it('should parse passing coverage output correctly', () => {
      const result = parseCoverage(PASSING_COVERAGE_OUTPUT);

      expect(result).not.toBeNull();
      expect(result?.functions).toBe(100);
      expect(result?.lines).toBe(100);
    });

    it('should parse failing coverage output correctly', () => {
      const result = parseCoverage(FAILING_COVERAGE_OUTPUT);

      expect(result).not.toBeNull();
      expect(result?.functions).toBe(95.76);
      expect(result?.lines).toBe(96.53);
    });

    it('should return null when no coverage data in output', () => {
      const result = parseCoverage(NO_COVERAGE_OUTPUT);

      expect(result).toBeNull();
    });

    it('should handle edge case percentages', () => {
      const edgeOutput = `
All files                                                  |    0.00 |    0.00 |
`;
      const result = parseCoverage(edgeOutput);

      expect(result).not.toBeNull();
      expect(result?.functions).toBe(0);
      expect(result?.lines).toBe(0);
    });

    it('should handle decimal percentages', () => {
      const decimalOutput = `
All files                                                  |   99.99 |   99.99 |
`;
      const result = parseCoverage(decimalOutput);

      expect(result).not.toBeNull();
      expect(result?.functions).toBe(99.99);
      expect(result?.lines).toBe(99.99);
    });
  });

  describe('checkThresholds', () => {
    const defaultThresholds = { functions: 100, lines: 100 };

    it('should return empty array when coverage meets thresholds', () => {
      const coverage = { functions: 100, lines: 100 };
      const failures = checkThresholds(coverage, defaultThresholds);

      expect(failures).toEqual([]);
    });

    it('should return failures when functions coverage is below threshold', () => {
      const coverage = { functions: 95.76, lines: 100 };
      const failures = checkThresholds(coverage, defaultThresholds);

      expect(failures.length).toBe(1);
      expect(failures[0]).toContain('Functions coverage');
      expect(failures[0]).toContain('95.76%');
    });

    it('should return failures when lines coverage is below threshold', () => {
      const coverage = { functions: 100, lines: 96.53 };
      const failures = checkThresholds(coverage, defaultThresholds);

      expect(failures.length).toBe(1);
      expect(failures[0]).toContain('Lines coverage');
      expect(failures[0]).toContain('96.53%');
    });

    it('should return multiple failures when both are below threshold', () => {
      const coverage = { functions: 95.76, lines: 96.53 };
      const failures = checkThresholds(coverage, defaultThresholds);

      expect(failures.length).toBe(2);
      expect(failures[0]).toContain('Functions coverage');
      expect(failures[1]).toContain('Lines coverage');
    });

    it('should work with custom thresholds', () => {
      const coverage = { functions: 90, lines: 90 };
      const customThresholds = { functions: 80, lines: 80 };
      const failures = checkThresholds(coverage, customThresholds);

      expect(failures).toEqual([]);
    });

    it('should handle exactly matching thresholds', () => {
      const coverage = { functions: 100, lines: 100 };
      const failures = checkThresholds(coverage, defaultThresholds);

      expect(failures).toEqual([]);
    });

    it('should handle coverage just below threshold', () => {
      const coverage = { functions: 99.99, lines: 99.99 };
      const failures = checkThresholds(coverage, defaultThresholds);

      expect(failures.length).toBe(2);
    });
  });

  describe('integration behavior', () => {
    it('should correctly identify passing coverage scenario', () => {
      const coverage = parseCoverage(PASSING_COVERAGE_OUTPUT);
      expect(coverage).not.toBeNull();

      const failures = checkThresholds(coverage!, { functions: 100, lines: 100 });
      expect(failures).toEqual([]);
    });

    it('should correctly identify failing coverage scenario', () => {
      const coverage = parseCoverage(FAILING_COVERAGE_OUTPUT);
      expect(coverage).not.toBeNull();

      const failures = checkThresholds(coverage!, { functions: 100, lines: 100 });
      expect(failures.length).toBe(2);
    });
  });
});
