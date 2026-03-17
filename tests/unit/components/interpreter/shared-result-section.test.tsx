import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { SharedResultSection } from '@/components/interpreter/shared-result-section';
import { encodeInterpretation } from '@/lib/share-encoding';
import type { InterpretationResult } from '@/types';

// Mock the hooks used by InterpreterClient
mock.module('@/hooks/use-rate-limit', () => ({
  useRateLimit: () => ({ remaining: 3, maxUses: 3, recordUse: () => {} }),
}));

// Mock streaming interpreter form
mock.module('@/components/interpreter/streaming-interpreter-form', () => ({
  StreamingInterpreterForm: () => <div data-testid="mock-streaming-form">Interpreter Form</div>,
}));

// Mock upgrade prompt
mock.module('@/components/interpreter/upgrade-prompt', () => ({
  UpgradePrompt: () => null,
}));

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

  it('renders fallback form when encoded data is invalid', () => {
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
    expect(screen.getByTestId('mock-streaming-form')).toBeInTheDocument();
  });
});
