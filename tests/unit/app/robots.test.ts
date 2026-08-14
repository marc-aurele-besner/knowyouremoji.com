import { describe, it, expect } from 'bun:test';

describe('robots', () => {
  describe('robots function', () => {
    it('should return a valid robots configuration object', async () => {
      const { default: robots } = await import('../../../src/app/robots');
      const result = robots();

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should include sitemap URL', async () => {
      const { default: robots } = await import('../../../src/app/robots');
      const result = robots();

      expect(result.sitemap).toBeDefined();
      expect(result.sitemap).toContain('/sitemap.xml');
    });

    it('should have host property', async () => {
      const { default: robots } = await import('../../../src/app/robots');
      const result = robots();

      expect(result.host).toBeDefined();
      expect(result.host).toMatch(/^https?:\/\//);
    });

    it('should have rules for all user agents', async () => {
      const { default: robots } = await import('../../../src/app/robots');
      const result = robots();

      expect(result.rules).toBeDefined();

      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      expect(rules.length).toBeGreaterThan(0);

      const allAgentRule = rules.find(
        (rule) =>
          rule.userAgent === '*' || (Array.isArray(rule.userAgent) && rule.userAgent.includes('*'))
      );
      expect(allAgentRule).toBeDefined();
    });

    it('should allow crawling of public pages', async () => {
      const { default: robots } = await import('../../../src/app/robots');
      const result = robots();

      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const allAgentRule = rules.find(
        (rule) =>
          rule.userAgent === '*' || (Array.isArray(rule.userAgent) && rule.userAgent.includes('*'))
      );

      expect(allAgentRule?.allow).toBeDefined();
      const allowPaths = Array.isArray(allAgentRule?.allow)
        ? allAgentRule?.allow
        : [allAgentRule?.allow];
      expect(allowPaths).toContain('/');
    });

    it('should disallow crawling of API routes', async () => {
      const { default: robots } = await import('../../../src/app/robots');
      const result = robots();

      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const allAgentRule = rules.find(
        (rule) =>
          rule.userAgent === '*' || (Array.isArray(rule.userAgent) && rule.userAgent.includes('*'))
      );

      expect(allAgentRule?.disallow).toBeDefined();
      const disallowPaths = Array.isArray(allAgentRule?.disallow)
        ? allAgentRule?.disallow
        : [allAgentRule?.disallow];
      expect(disallowPaths).toContain('/api/');
    });

    it('should disallow crawling of private app areas (dashboard/admin/auth)', async () => {
      const { default: robots } = await import('../../../src/app/robots');
      const result = robots();

      const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
      const allAgentRule = rules.find(
        (rule) =>
          rule.userAgent === '*' || (Array.isArray(rule.userAgent) && rule.userAgent.includes('*'))
      );

      expect(allAgentRule?.disallow).toBeDefined();
      const disallowPaths = Array.isArray(allAgentRule?.disallow)
        ? allAgentRule?.disallow
        : [allAgentRule?.disallow];

      expect(disallowPaths).toContain('/dashboard');
      expect(disallowPaths).toContain('/admin');
      expect(disallowPaths).toContain('/login');
      expect(disallowPaths).toContain('/register');
    });

    it('should use correct base URL from metadata', async () => {
      const { default: robots } = await import('../../../src/app/robots');
      const result = robots();

      expect(result.sitemap).toMatch(/^https?:\/\//);
    });
  });
});
