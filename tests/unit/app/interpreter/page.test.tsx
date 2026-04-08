import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';

// Mock localStorage
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  };
};

// Mock useRateLimit hook
mock.module('@/hooks/use-rate-limit', () => ({
  useRateLimit: () => ({
    remaining: 3,
    used: 0,
    maxUses: 3,
    canUse: true,
    isLimited: false,
    resetTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    recordUse: mock(() => 2),
    reset: mock(() => {}),
  }),
}));

// Mock useStreamingInterpret hook
mock.module('@/hooks/use-streaming-interpret', () => ({
  useStreamingInterpret: () => ({
    text: '',
    isLoading: false,
    error: null,
    interpret: mock(() => {}),
    stop: mock(() => {}),
    reset: mock(() => {}),
  }),
}));

import InterpreterPage, { generateMetadata } from '@/app/interpreter/page';

beforeEach(() => {
  const localStorageMock = createLocalStorageMock();
  globalThis.localStorage = localStorageMock;
});

afterEach(() => {
  cleanup();
});

const defaultSearchParams = Promise.resolve({} as { r?: string });

describe('InterpreterPage', () => {
  it('renders the main heading', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    expect(
      screen.getByRole('heading', { level: 1, name: /emoji interpreter/i })
    ).toBeInTheDocument();
  });

  it('renders the page description', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    expect(
      screen.getByText(/paste a message with emojis and we.?ll decode what they really mean/i)
    ).toBeInTheDocument();
  });

  it('renders main content area', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders breadcrumb navigation', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it('has breadcrumb with Home link', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });

  it('has breadcrumb with current page indicator', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    const currentPage = screen.getByText('Interpreter');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('renders hero section with appropriate styling', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-bold');
  });

  it('renders the interpreter form section', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    const formSection = screen.getByTestId('interpreter-form-section');
    expect(formSection).toBeInTheDocument();
  });

  it('renders the interpreter form with message input', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
  });

  it('renders the usage counter', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    expect(screen.getByTestId('usage-counter')).toBeInTheDocument();
  });

  it('renders the interpret button', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    expect(screen.getByRole('button', { name: /interpret/i })).toBeInTheDocument();
  });

  it('uses semantic article element for hero content', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    // Check that the page has proper semantic structure
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('applies container layout classes', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container');
  });

  it('has maximum width constraint for readability', async () => {
    const page = await InterpreterPage({ searchParams: defaultSearchParams });
    render(page);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-4xl');
  });
});

describe('generateMetadata', () => {
  const defaultMetadataParams = { searchParams: Promise.resolve({} as { r?: string }) };

  it('returns metadata with correct title', async () => {
    const metadata = await generateMetadata(defaultMetadataParams);

    expect(metadata.title).toBe('Emoji Interpreter - Decode Hidden Meanings | KnowYourEmoji');
  });

  it('returns metadata with correct description', async () => {
    const metadata = await generateMetadata(defaultMetadataParams);

    expect(metadata.description).toBe(
      'Paste any text message with emojis and our AI will decode the hidden meanings, tone, and context.'
    );
  });

  it('includes canonical URL pointing to interpreter page', async () => {
    const metadata = await generateMetadata(defaultMetadataParams);

    expect(metadata.alternates).toBeDefined();
    expect(metadata.alternates?.canonical).toBeDefined();
    const canonical = metadata.alternates?.canonical as string;
    expect(canonical).toContain('/interpreter');
  });

  it('includes Open Graph metadata', async () => {
    const metadata = await generateMetadata(defaultMetadataParams);

    const openGraph = metadata.openGraph as {
      type?: string;
      url?: string;
      siteName?: string;
      title?: string;
      description?: string;
    };
    expect(openGraph).toBeDefined();
    expect(openGraph?.type).toBe('website');
    expect(openGraph?.url).toContain('/interpreter');
    expect(openGraph?.title).toBe('Emoji Interpreter - Decode Hidden Meanings');
    expect(openGraph?.description).toBe(
      'Paste any text message with emojis and our AI will decode the hidden meanings, tone, and context.'
    );
  });

  it('includes Twitter Card metadata', async () => {
    const metadata = await generateMetadata(defaultMetadataParams);

    const twitter = metadata.twitter as {
      card?: string;
      title?: string;
      description?: string;
    };
    expect(twitter).toBeDefined();
    expect(twitter?.card).toBe('summary_large_image');
    expect(twitter?.title).toBe('Emoji Interpreter - Decode Hidden Meanings');
    expect(twitter?.description).toBe(
      'Paste any text message with emojis and our AI will decode the hidden meanings, tone, and context.'
    );
  });

  it('includes robots directives', async () => {
    const metadata = await generateMetadata(defaultMetadataParams);

    expect(metadata.robots).toBeDefined();
    expect(metadata.robots).toEqual({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    });
  });

  it('includes keywords', async () => {
    const metadata = await generateMetadata(defaultMetadataParams);

    expect(metadata.keywords).toBeDefined();
    expect(Array.isArray(metadata.keywords)).toBe(true);
    const keywords = metadata.keywords as string[];
    expect(keywords).toContain('emoji interpreter');
    expect(keywords).toContain('decode emoji');
  });

  it('uses dynamic OG image for shared interpretations', async () => {
    // Create a valid encoded interpretation
    const { encodeInterpretation } = await import('@/lib/share-encoding');
    const { createInterpretationResult } = await import('../../../utils');
    const encoded = encodeInterpretation(
      createInterpretationResult({
        message: 'Test message 😊',
        interpretation: 'A positive test interpretation.',
        metrics: {
          overallTone: 'positive',
          sarcasmProbability: 5,
          passiveAggressionProbability: 2,
          confidence: 90,
        },
      })
    );

    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ r: encoded }),
    });

    const openGraph = metadata.openGraph as {
      images?: Array<{ url: string }>;
      title?: string;
      url?: string;
    };
    expect(openGraph?.images?.[0]?.url).toContain('/og/interpretation?r=');
    expect(openGraph?.title).toContain('Test message');
    expect(openGraph?.url).toContain('?r=');
  });

  it('uses default OG image for invalid shared data', async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ r: 'invalid-data' }),
    });

    const openGraph = metadata.openGraph as { images?: Array<{ url: string }>; title?: string };
    expect(openGraph?.images?.[0]?.url).toContain('/og-image.png');
    expect(openGraph?.title).toBe('Emoji Interpreter - Decode Hidden Meanings');
  });
});
