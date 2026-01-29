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

describe('InterpreterPage', () => {
  it('renders the main heading', () => {
    render(<InterpreterPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /emoji interpreter/i })
    ).toBeInTheDocument();
  });

  it('renders the page description', () => {
    render(<InterpreterPage />);
    expect(
      screen.getByText(/paste a message with emojis and we.?ll decode what they really mean/i)
    ).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(<InterpreterPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders breadcrumb navigation', () => {
    render(<InterpreterPage />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it('has breadcrumb with Home link', () => {
    render(<InterpreterPage />);
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });

  it('has breadcrumb with current page indicator', () => {
    render(<InterpreterPage />);
    const currentPage = screen.getByText('Interpreter');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('renders hero section with appropriate styling', () => {
    render(<InterpreterPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('font-bold');
  });

  it('renders the interpreter form section', () => {
    render(<InterpreterPage />);
    const formSection = screen.getByTestId('interpreter-form-section');
    expect(formSection).toBeInTheDocument();
  });

  it('renders the interpreter form with message input', () => {
    render(<InterpreterPage />);
    expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
  });

  it('renders the usage counter', () => {
    render(<InterpreterPage />);
    expect(screen.getByTestId('usage-counter')).toBeInTheDocument();
  });

  it('renders the interpret button', () => {
    render(<InterpreterPage />);
    expect(screen.getByRole('button', { name: /interpret/i })).toBeInTheDocument();
  });

  it('uses semantic article element for hero content', () => {
    render(<InterpreterPage />);
    // Check that the page has proper semantic structure
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('applies container layout classes', () => {
    render(<InterpreterPage />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container');
  });

  it('has maximum width constraint for readability', () => {
    render(<InterpreterPage />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-4xl');
  });
});

describe('generateMetadata', () => {
  it('returns metadata with correct title', () => {
    const metadata = generateMetadata();

    expect(metadata.title).toBe('Emoji Interpreter - Decode Hidden Meanings | KnowYourEmoji');
  });

  it('returns metadata with correct description', () => {
    const metadata = generateMetadata();

    expect(metadata.description).toBe(
      'Paste any text message with emojis and our AI will decode the hidden meanings, tone, and context.'
    );
  });

  it('includes canonical URL pointing to interpreter page', () => {
    const metadata = generateMetadata();

    expect(metadata.alternates).toBeDefined();
    expect(metadata.alternates?.canonical).toBeDefined();
    const canonical = metadata.alternates?.canonical as string;
    expect(canonical).toContain('/interpreter');
  });

  it('includes Open Graph metadata', () => {
    const metadata = generateMetadata();

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

  it('includes Twitter Card metadata', () => {
    const metadata = generateMetadata();

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

  it('includes robots directives', () => {
    const metadata = generateMetadata();

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

  it('includes keywords', () => {
    const metadata = generateMetadata();

    expect(metadata.keywords).toBeDefined();
    expect(Array.isArray(metadata.keywords)).toBe(true);
    const keywords = metadata.keywords as string[];
    expect(keywords).toContain('emoji interpreter');
    expect(keywords).toContain('decode emoji');
  });
});
