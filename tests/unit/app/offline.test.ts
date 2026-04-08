import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import OfflinePage, { metadata } from '../../../src/app/offline/page';

// Store original env
const originalEnv = { ...process.env };

describe('Offline Page', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('metadata', () => {
    test('has correct title', () => {
      expect(metadata.title).toBe('Offline — KnowYourEmoji');
    });

    test('has correct description', () => {
      expect(metadata.description).toContain('offline');
    });
  });

  describe('rendering', () => {
    test('renders the offline page component', () => {
      const page = OfflinePage();
      expect(page).toBeDefined();
      expect(page.type).toBe('main');
    });

    test('renders the heading', () => {
      const page = OfflinePage();
      const pageStr = JSON.stringify(page);
      expect(pageStr).toContain("You're Offline");
    });

    test('renders the offline emoji icon', () => {
      const page = OfflinePage();
      const pageStr = JSON.stringify(page);
      expect(pageStr).toContain('📡');
    });

    test('renders what-you-can-do list', () => {
      const page = OfflinePage();
      const pageStr = JSON.stringify(page);
      expect(pageStr).toContain('Browse previously visited emoji pages');
      expect(pageStr).toContain('View cached combo interpretations');
      expect(pageStr).toContain('Use the AI interpreter (requires connection)');
      expect(pageStr).toContain('Search for new emojis');
    });

    test('renders auto-reload message', () => {
      const page = OfflinePage();
      const pageStr = JSON.stringify(page);
      expect(pageStr).toContain('automatically reload');
    });

    test('has correct accessibility attributes', () => {
      const page = OfflinePage();
      const pageStr = JSON.stringify(page);
      expect(pageStr).toContain('Disconnected');
    });
  });
});
