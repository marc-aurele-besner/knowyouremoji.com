import { describe, test, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import SearchPage, { generateMetadata } from '@/app/search/page';

afterEach(() => {
  cleanup();
});

describe('SearchPage', () => {
  describe('Page rendering', () => {
    test('renders the page title', () => {
      render(<SearchPage />);
      expect(
        screen.getByRole('heading', { level: 1, name: /search emojis & combos/i })
      ).toBeInTheDocument();
    });

    test('renders page content without layout components', () => {
      render(<SearchPage />);
      // Page should render its main content
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('displays emoji and combo count in description', () => {
      render(<SearchPage />);
      // Should have text mentioning content counts
      expect(screen.getByText(/find context-aware meanings/i)).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<SearchPage />);
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    test('renders tab buttons for emojis and combos', () => {
      render(<SearchPage />);
      expect(screen.getByRole('tab', { name: /emojis/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /combos/i })).toBeInTheDocument();
    });

    test('renders emoji results initially', () => {
      render(<SearchPage />);
      // Should render emoji results list
      expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
    });

    test('renders category filter', () => {
      render(<SearchPage />);
      expect(
        screen.getByRole('combobox', { name: /filter emojis by category/i })
      ).toBeInTheDocument();
    });
  });

  describe('Metadata generation', () => {
    test('generateMetadata returns proper title', () => {
      const metadata = generateMetadata();
      expect(metadata.title).toContain('Search');
    });

    test('generateMetadata returns proper description', () => {
      const metadata = generateMetadata();
      expect(metadata.description).toContain('emoji');
    });

    test('generateMetadata includes canonical URL', () => {
      const metadata = generateMetadata();
      expect(metadata.alternates?.canonical).toContain('/search');
    });

    test('generateMetadata includes OpenGraph data', () => {
      const metadata = generateMetadata();
      expect(metadata.openGraph?.title).toBeDefined();
      expect(metadata.openGraph?.description).toBeDefined();
    });

    test('generateMetadata includes Twitter card data', () => {
      const metadata = generateMetadata();
      const twitter = metadata.twitter as
        | { card?: string; title?: string; description?: string }
        | undefined;
      expect(twitter?.card).toBe('summary_large_image');
      expect(twitter?.title).toBeDefined();
      expect(twitter?.description).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<SearchPage />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    test('search input has accessible label', () => {
      render(<SearchPage />);
      expect(screen.getByRole('searchbox')).toHaveAccessibleName(/search emojis and combos/i);
    });

    test('category filter has accessible label', () => {
      render(<SearchPage />);
      expect(
        screen.getByRole('combobox', { name: /filter emojis by category/i })
      ).toBeInTheDocument();
    });
  });
});
