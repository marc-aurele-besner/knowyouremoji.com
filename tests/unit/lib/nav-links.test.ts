import { describe, expect, test } from 'bun:test';
import { FOOTER_LEGAL_LINKS, PRIMARY_NAV_LINKS } from '../../../src/lib/nav-links';

describe('nav-links', () => {
  test('PRIMARY_NAV_LINKS includes the publisher-trust links required by #344', () => {
    const labels = PRIMARY_NAV_LINKS.map((l) => l.label);
    expect(labels).toContain('Guides');
    expect(labels).toContain('About');
    expect(labels).toContain('Contact');
  });

  test('PRIMARY_NAV_LINKS exposes at least one tool + one editorial surface', () => {
    const labels = PRIMARY_NAV_LINKS.map((l) => l.label);
    expect(labels).toContain('Interpreter');
    expect(labels.some((l) => l === 'Guides' || l === 'Emojis' || l === 'Combos')).toBe(true);
  });

  test('every nav link has a non-empty label and href', () => {
    for (const link of [...PRIMARY_NAV_LINKS, ...FOOTER_LEGAL_LINKS]) {
      expect(link.label).toBeTruthy();
      expect(link.href).toBeTruthy();
      expect(link.href.startsWith('/') || link.href.startsWith('http')).toBe(true);
    }
  });

  test('FOOTER_LEGAL_LINKS links only Privacy and Terms', () => {
    const labels = FOOTER_LEGAL_LINKS.map((l) => l.label);
    expect(labels).toContain('Privacy');
    expect(labels).toContain('Terms');
    // About / Contact live in PRIMARY_NAV_LINKS instead so they appear once
    expect(labels).not.toContain('About');
    expect(labels).not.toContain('Contact');
  });
});
