import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { SharedResultSection } from '@/components/interpreter/shared-result-section';
import { encodeInterpretation } from '@/lib/share-encoding';
import type { InterpretationResult } from '@/types';

// Mock the hooks used by InterpreterClient (same as other interpreter tests)
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

// Mock localStorage for rate limit
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

beforeEach(() => {
  globalThis.localStorage = createLocalStorageMock();
});

afterEach(() => {
  cleanup();
});

const mockResult: InterpretationResult = {
  id: 'test-123',
  message: 'Hey 😊 how are you?',
  emojis: [{ character: '😊', meaning: 'Warmth', slug: 'smiling-face' }],
  interpretation: 'A friendly greeting.',
  metrics: {
    sarcasmProbability: 10,
    passiveAggressionProbability: 5,
    overallTone: 'positive',
    confidence: 85,
  },
  redFlags: [],
  timestamp: '2024-01-15T10:00:00.000Z',
};

describe('SharedResultSection', () => {
  it('renders shared interpretation when valid encoded data is provided', () => {
    const encoded = encodeInterpretation(mockResult);
    render(<SharedResultSection encodedResult={encoded} />);
    expect(screen.getByText('Shared Result')).toBeInTheDocument();
    expect(screen.getByText('A friendly greeting.')).toBeInTheDocument();
  });

  it('renders fallback message when encoded data is invalid', () => {
    render(<SharedResultSection encodedResult="invalid-data" />);
    expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
  });

  it('renders interpreter form below shared result', () => {
    const encoded = encodeInterpretation(mockResult);
    render(<SharedResultSection encodedResult={encoded} />);
    expect(screen.getByText('Try It Yourself')).toBeInTheDocument();
  });

  it('renders interpreter form for invalid data', () => {
    render(<SharedResultSection encodedResult="bad-data" />);
    // The real InterpreterClient should render with mocked hooks
    expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
  });
});
