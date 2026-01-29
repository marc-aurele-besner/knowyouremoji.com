import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('vercel.json configuration', () => {
  const vercelJsonPath = join(process.cwd(), 'vercel.json');

  it('should exist in the project root', () => {
    expect(existsSync(vercelJsonPath)).toBe(true);
  });

  it('should be valid JSON', () => {
    const content = readFileSync(vercelJsonPath, 'utf-8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  describe('configuration structure', () => {
    let config: Record<string, unknown>;

    it('should parse successfully', () => {
      const content = readFileSync(vercelJsonPath, 'utf-8');
      config = JSON.parse(content);
      expect(config).toBeDefined();
    });

    it('should specify framework as nextjs', () => {
      const content = readFileSync(vercelJsonPath, 'utf-8');
      config = JSON.parse(content);
      expect(config.framework).toBe('nextjs');
    });

    it('should specify build output directory', () => {
      const content = readFileSync(vercelJsonPath, 'utf-8');
      config = JSON.parse(content);
      expect(config.outputDirectory).toBe('.next');
    });

    it('should specify install command using bun', () => {
      const content = readFileSync(vercelJsonPath, 'utf-8');
      config = JSON.parse(content);
      expect(config.installCommand).toBe('bun install');
    });

    it('should specify build command using bun', () => {
      const content = readFileSync(vercelJsonPath, 'utf-8');
      config = JSON.parse(content);
      expect(config.buildCommand).toBe('bun run build');
    });

    it('should have security headers configured', () => {
      const content = readFileSync(vercelJsonPath, 'utf-8');
      config = JSON.parse(content);
      expect(config.headers).toBeDefined();
      expect(Array.isArray(config.headers)).toBe(true);
    });

    it('should have global security headers for all routes', () => {
      const content = readFileSync(vercelJsonPath, 'utf-8');
      config = JSON.parse(content);
      const headers = config.headers as Array<{
        source: string;
        headers: Array<{ key: string; value: string }>;
      }>;
      const globalHeaders = headers.find((h) => h.source === '/:path*');
      expect(globalHeaders).toBeDefined();
      expect(globalHeaders?.headers).toBeDefined();

      const headerKeys = globalHeaders?.headers.map((h) => h.key);
      expect(headerKeys).toContain('X-Content-Type-Options');
      expect(headerKeys).toContain('X-Frame-Options');
      expect(headerKeys).toContain('X-XSS-Protection');
    });
  });

  describe('environment variables documentation', () => {
    it('should not include actual secrets in vercel.json', () => {
      const content = readFileSync(vercelJsonPath, 'utf-8');
      expect(content).not.toContain('sk-');
      expect(content).not.toContain('API_KEY=');
      expect(content).not.toContain('SECRET');
    });
  });
});
