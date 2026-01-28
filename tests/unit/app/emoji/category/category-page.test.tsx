import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Track if notFound was called
let notFoundCalled = false;

// Mock next/navigation
mock.module('next/navigation', () => ({
  notFound: () => {
    notFoundCalled = true;
    throw new Error('NEXT_NOT_FOUND');
  },
}));

// We need to test the components individually since we cannot easily mock server components
describe('CategoryPage utilities', () => {
  describe('getCategoryInfo', () => {
    it('returns category info for valid categories', async () => {
      const { getCategoryInfo } = await import('@/lib/emoji-data');
      const info = getCategoryInfo('faces');
      expect(info).not.toBeNull();
      expect(info?.slug).toBe('faces');
      expect(info?.displayName).toBe('Smileys & Faces');
    });

    it('returns null for invalid categories', async () => {
      const { getCategoryInfo } = await import('@/lib/emoji-data');
      const info = getCategoryInfo('invalid-category');
      expect(info).toBeNull();
    });
  });

  describe('getEmojiSummariesByCategory', () => {
    it('returns emoji summaries for valid categories', async () => {
      const { getEmojiSummariesByCategory } = await import('@/lib/emoji-data');
      const summaries = getEmojiSummariesByCategory('faces');
      expect(Array.isArray(summaries)).toBe(true);
      expect(summaries.length).toBeGreaterThan(0);
      summaries.forEach((emoji) => {
        expect(emoji.category).toBe('faces');
      });
    });

    it('returns empty array for invalid categories', async () => {
      const { getEmojiSummariesByCategory } = await import('@/lib/emoji-data');
      const summaries = getEmojiSummariesByCategory('invalid-category');
      expect(summaries).toEqual([]);
    });
  });

  describe('getAllCategories', () => {
    it('returns all categories that have emojis', async () => {
      const { getAllCategories } = await import('@/lib/emoji-data');
      const categories = getAllCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toContain('faces');
    });
  });
});

describe('CategoryLoading component', () => {
  it('renders loading skeletons', async () => {
    const CategoryLoading = (await import('@/app/emoji/category/[category]/loading')).default;
    render(<CategoryLoading />);

    // Check for main element
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('renders multiple skeleton cards', async () => {
    const CategoryLoading = (await import('@/app/emoji/category/[category]/loading')).default;
    const { container } = render(<CategoryLoading />);

    // Check for skeleton cards
    const cards = container.querySelectorAll('.grid > div');
    expect(cards.length).toBe(12);
  });
});

describe('CategoryNotFound component', () => {
  it('renders not found message', async () => {
    const CategoryNotFound = (await import('@/app/emoji/category/[category]/not-found')).default;
    render(<CategoryNotFound />);

    expect(screen.getByText('Category Not Found')).toBeInTheDocument();
  });

  it('renders links to home and emojis', async () => {
    const CategoryNotFound = (await import('@/app/emoji/category/[category]/not-found')).default;
    render(<CategoryNotFound />);

    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toHaveAttribute('href', '/');

    const emojisLink = screen.getByRole('link', { name: /browse all emojis/i });
    expect(emojisLink).toHaveAttribute('href', '/emoji');
  });

  it('has proper heading structure', async () => {
    const CategoryNotFound = (await import('@/app/emoji/category/[category]/not-found')).default;
    render(<CategoryNotFound />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Category Not Found');
  });
});

describe('Category page static params generation', () => {
  it('generateStaticParams returns all categories', async () => {
    const { generateStaticParams } = await import('@/app/emoji/category/[category]/page');
    const params = await generateStaticParams();
    expect(Array.isArray(params)).toBe(true);
    expect(params.length).toBeGreaterThan(0);
    // Each param should have a category property
    params.forEach((param) => {
      expect(param).toHaveProperty('category');
      expect(typeof param.category).toBe('string');
    });
  });
});

describe('Category page metadata generation', () => {
  it('generateMetadata returns metadata for valid categories', async () => {
    const { generateMetadata } = await import('@/app/emoji/category/[category]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ category: 'faces' }) });
    expect(metadata).toHaveProperty('title');
    expect(metadata).toHaveProperty('description');
    expect(metadata.title).toContain('Smileys & Faces');
  });

  it('generateMetadata returns empty object for invalid categories', async () => {
    const { generateMetadata } = await import('@/app/emoji/category/[category]/page');
    const metadata = await generateMetadata({
      params: Promise.resolve({ category: 'invalid-category' }),
    });
    expect(metadata).toEqual({});
  });

  it('generateMetadata includes OpenGraph properties', async () => {
    const { generateMetadata } = await import('@/app/emoji/category/[category]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ category: 'faces' }) });
    expect(metadata).toHaveProperty('openGraph');
    expect(metadata.openGraph?.title).toContain('Smileys & Faces');
  });

  it('generateMetadata includes Twitter properties', async () => {
    const { generateMetadata } = await import('@/app/emoji/category/[category]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ category: 'faces' }) });
    expect(metadata).toHaveProperty('twitter');
    expect(metadata.twitter?.title).toContain('Smileys & Faces');
  });

  it('generateMetadata includes keywords', async () => {
    const { generateMetadata } = await import('@/app/emoji/category/[category]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ category: 'faces' }) });
    expect(metadata).toHaveProperty('keywords');
    expect(Array.isArray(metadata.keywords)).toBe(true);
  });

  it('generateMetadata includes canonical URL', async () => {
    const { generateMetadata } = await import('@/app/emoji/category/[category]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ category: 'faces' }) });
    expect(metadata).toHaveProperty('alternates');
    expect(metadata.alternates?.canonical).toContain('/emoji/category/faces');
  });
});

describe('CategoryPage component', () => {
  it('calls notFound for invalid category', async () => {
    notFoundCalled = false;
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;

    try {
      await CategoryPage({ params: Promise.resolve({ category: 'invalid-category' }) });
    } catch {
      // Expected to throw due to notFound()
    }

    expect(notFoundCalled).toBe(true);
  });

  it('renders page for valid category', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Smileys & Faces Emojis');
  });

  it('renders breadcrumb navigation', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    // Check for breadcrumb links
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /emojis/i })).toHaveAttribute('href', '/emoji');
  });

  it('renders category description', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    expect(screen.getByText(/explore smileys/i)).toBeInTheDocument();
  });

  it('renders emoji count', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    // Check for emoji count text (matches "33 emojis in this category" pattern)
    expect(screen.getByText(/in this category/i)).toBeInTheDocument();
  });

  it('renders emoji grid with cards', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    // Check for emoji characters (should have at least one)
    expect(screen.getByText('💀')).toBeInTheDocument();
  });

  it('renders emoji links with correct hrefs', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    // Check for emoji detail links
    const skullLink = screen.getByRole('link', { name: /skull emoji/i });
    expect(skullLink).toHaveAttribute('href', '/emoji/skull');
  });

  it('renders emoji names', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    expect(screen.getByText('Skull')).toBeInTheDocument();
  });

  it('renders emoji tldr descriptions', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    // Check for tldr text (using a partial match since it might be truncated)
    const tldrElements = screen.getAllByText(/usually means/i);
    expect(tldrElements.length).toBeGreaterThan(0);
  });

  it('has accessible section with sr-only heading', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    // Check for visually hidden heading
    const hiddenHeading = screen.getByRole('heading', { level: 2 });
    expect(hiddenHeading).toHaveClass('sr-only');
  });

  it('renders with proper container styling', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;
    const page = await CategoryPage({ params: Promise.resolve({ category: 'faces' }) });

    render(page);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('container');
  });

  it('works with different categories', async () => {
    const CategoryPage = (await import('@/app/emoji/category/[category]/page')).default;

    // Test with people category
    const peoplePage = await CategoryPage({ params: Promise.resolve({ category: 'people' }) });
    render(peoplePage);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('People & Body Emojis');
    cleanup();

    // Test with objects category
    const objectsPage = await CategoryPage({ params: Promise.resolve({ category: 'objects' }) });
    render(objectsPage);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Objects Emojis');
  });
});
