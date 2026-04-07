import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SharedInterpretationView } from '@/components/interpreter/shared-interpretation-view';
import type { SharedInterpretation } from '@/lib/share-encoding';

// Mock analytics
const mockShareView = mock(() => {});
const mockShareConversion = mock(() => {});
mock.module('@/lib/analytics', () => ({
  shareEvents: {
    share: mock(() => {}),
    copyLink: mock(() => {}),
    shareView: mockShareView,
    shareConversion: mockShareConversion,
    shareReShare: mock(() => {}),
  },
}));

// Mock sendGAEvent
mock.module('@next/third-parties/google', () => ({
  sendGAEvent: mock(() => {}),
}));

afterEach(() => {
  cleanup();
  mockShareView.mockClear();
  mockShareConversion.mockClear();
});

const mockData: SharedInterpretation = {
  message: 'Hey 😊 how are you?',
  interpretation: 'A friendly greeting expressing warmth.',
  tone: 'positive',
  sarcasm: 10,
  passiveAggression: 5,
  confidence: 85,
};

describe('SharedInterpretationView', () => {
  it('renders shared result badge', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByText('Shared Result')).toBeInTheDocument();
  });

  it('renders ShareableCard with interpretation data', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByTestId('shareable-card')).toBeInTheDocument();
    expect(screen.getByText(mockData.interpretation)).toBeInTheDocument();
  });

  it('renders original message', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByText(/Hey 😊 how are you\?/)).toBeInTheDocument();
  });

  it('renders tone badge via ShareableCard', () => {
    render(<SharedInterpretationView data={mockData} />);
    const badge = screen.getByTestId('shareable-card-tone-badge');
    expect(badge).toHaveTextContent('Positive');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('renders negative tone badge', () => {
    render(<SharedInterpretationView data={{ ...mockData, tone: 'negative' }} />);
    const badge = screen.getByTestId('shareable-card-tone-badge');
    expect(badge).toHaveTextContent('Negative');
    expect(badge).toHaveClass('bg-red-100');
  });

  it('renders neutral tone badge', () => {
    render(<SharedInterpretationView data={{ ...mockData, tone: 'neutral' }} />);
    const badge = screen.getByTestId('shareable-card-tone-badge');
    expect(badge).toHaveTextContent('Neutral');
  });

  it('renders confidence level', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByText('85% confidence')).toBeInTheDocument();
  });

  it('renders sarcasm metric', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByTestId('shareable-card-sarcasm')).toBeInTheDocument();
  });

  it('renders passive-aggression metric', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByTestId('shareable-card-passive-aggression')).toBeInTheDocument();
  });

  it('renders CTA button linking to interpreter', () => {
    render(<SharedInterpretationView data={mockData} />);
    const link = screen.getByRole('link', { name: /try the interpreter yourself/i });
    expect(link).toHaveAttribute('href', '/interpreter');
  });

  it('accepts custom className', () => {
    const { container } = render(<SharedInterpretationView data={mockData} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('tracks share view on mount', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(mockShareView).toHaveBeenCalledWith(expect.any(String), 'interpretation');
  });

  it('tracks share conversion when CTA is clicked', () => {
    render(<SharedInterpretationView data={mockData} />);
    const link = screen.getByRole('link', { name: /try the interpreter yourself/i });
    fireEvent.click(link);
    expect(mockShareConversion).toHaveBeenCalledWith(expect.any(String), 'interpretation');
  });
});
