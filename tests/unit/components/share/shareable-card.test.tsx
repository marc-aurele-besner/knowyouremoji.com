import { describe, it, expect, afterEach, beforeEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ShareableCard } from '@/components/share/shareable-card';
import type { SharedInterpretation } from '@/lib/share-encoding';

// Mock analytics
mock.module('@/lib/analytics', () => ({
  shareEvents: {
    share: mock(() => {}),
    copyLink: mock(() => {}),
    shareView: mock(() => {}),
    shareConversion: mock(() => {}),
    shareReShare: mock(() => {}),
  },
}));

// Mock sendGAEvent
mock.module('@next/third-parties/google', () => ({
  sendGAEvent: mock(() => {}),
}));

beforeEach(() => {
  Object.defineProperty(navigator, 'share', {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
});

const mockData: SharedInterpretation = {
  message: 'Hey 😊 how are you?',
  interpretation: 'A friendly greeting expressing warmth and genuine interest.',
  tone: 'positive',
  sarcasm: 10,
  passiveAggression: 5,
  confidence: 85,
};

const defaultProps = {
  data: mockData,
  shareUrl: 'https://knowyouremoji.com/interpreter?r=abc123',
};

describe('ShareableCard', () => {
  it('renders the card container', () => {
    render(<ShareableCard {...defaultProps} />);
    expect(screen.getByTestId('shareable-card')).toBeInTheDocument();
  });

  it('renders branding text', () => {
    render(<ShareableCard {...defaultProps} />);
    expect(screen.getByText('KnowYourEmoji')).toBeInTheDocument();
  });

  it('renders the original message in quotes', () => {
    render(<ShareableCard {...defaultProps} />);
    expect(screen.getByText(/Hey 😊 how are you\?/)).toBeInTheDocument();
  });

  it('renders the interpretation text', () => {
    render(<ShareableCard {...defaultProps} />);
    expect(screen.getByText(mockData.interpretation)).toBeInTheDocument();
  });

  it('renders "What it really means" label', () => {
    render(<ShareableCard {...defaultProps} />);
    expect(screen.getByText('What it really means')).toBeInTheDocument();
  });

  it('renders confidence level', () => {
    render(<ShareableCard {...defaultProps} />);
    expect(screen.getByText('85% confidence')).toBeInTheDocument();
  });

  it('renders site URL in footer', () => {
    render(<ShareableCard {...defaultProps} />);
    expect(screen.getByText('knowyouremoji.com')).toBeInTheDocument();
  });

  describe('tone badge', () => {
    it('renders positive tone badge', () => {
      render(<ShareableCard {...defaultProps} />);
      const badge = screen.getByTestId('shareable-card-tone-badge');
      expect(badge).toHaveTextContent('Positive');
      expect(badge).toHaveClass('bg-green-100');
    });

    it('renders negative tone badge', () => {
      render(
        <ShareableCard data={{ ...mockData, tone: 'negative' }} shareUrl={defaultProps.shareUrl} />
      );
      const badge = screen.getByTestId('shareable-card-tone-badge');
      expect(badge).toHaveTextContent('Negative');
      expect(badge).toHaveClass('bg-red-100');
    });

    it('renders neutral tone badge', () => {
      render(
        <ShareableCard data={{ ...mockData, tone: 'neutral' }} shareUrl={defaultProps.shareUrl} />
      );
      const badge = screen.getByTestId('shareable-card-tone-badge');
      expect(badge).toHaveTextContent('Neutral');
      expect(badge).toHaveClass('bg-gray-100');
    });
  });

  describe('accent bar', () => {
    it('renders green accent for positive tone', () => {
      render(<ShareableCard {...defaultProps} />);
      const accent = screen.getByTestId('shareable-card-accent');
      expect(accent).toHaveClass('from-green-400');
    });

    it('renders red accent for negative tone', () => {
      render(
        <ShareableCard data={{ ...mockData, tone: 'negative' }} shareUrl={defaultProps.shareUrl} />
      );
      const accent = screen.getByTestId('shareable-card-accent');
      expect(accent).toHaveClass('from-red-400');
    });

    it('renders gray accent for neutral tone', () => {
      render(
        <ShareableCard data={{ ...mockData, tone: 'neutral' }} shareUrl={defaultProps.shareUrl} />
      );
      const accent = screen.getByTestId('shareable-card-accent');
      expect(accent).toHaveClass('from-gray-400');
    });
  });

  describe('metric bars', () => {
    it('renders sarcasm metric', () => {
      render(<ShareableCard {...defaultProps} />);
      const sarcasm = screen.getByTestId('shareable-card-sarcasm');
      expect(sarcasm).toBeInTheDocument();
      expect(sarcasm).toHaveTextContent('Sarcasm');
      expect(sarcasm).toHaveTextContent('10%');
    });

    it('renders passive-aggression metric', () => {
      render(<ShareableCard {...defaultProps} />);
      const pa = screen.getByTestId('shareable-card-passive-aggression');
      expect(pa).toBeInTheDocument();
      expect(pa).toHaveTextContent('Passive-aggression');
      expect(pa).toHaveTextContent('5%');
    });

    it('renders meter elements with correct aria attributes', () => {
      render(<ShareableCard {...defaultProps} />);
      const meters = screen.getAllByRole('meter');
      expect(meters.length).toBe(2);
      expect(meters[0]).toHaveAttribute('aria-valuenow', '10');
      expect(meters[1]).toHaveAttribute('aria-valuenow', '5');
    });
  });

  describe('actions', () => {
    it('renders copy as text button', () => {
      render(<ShareableCard {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /copy interpretation as text/i })
      ).toBeInTheDocument();
    });

    it('renders share section', () => {
      render(<ShareableCard {...defaultProps} />);
      expect(screen.getByTestId('shareable-card-actions')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('copies text to clipboard when copy button is clicked', async () => {
      const mockWriteText = mock(() => Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      render(<ShareableCard {...defaultProps} />);
      const copyButton = screen.getByRole('button', { name: /copy interpretation as text/i });
      fireEvent.click(copyButton);

      // Wait for async clipboard operation
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockWriteText).toHaveBeenCalled();
      const calls = mockWriteText.mock.calls as unknown[][];
      const copiedText = String(calls[0]?.[0] ?? '');
      expect(copiedText).toContain(mockData.message);
      expect(copiedText).toContain(mockData.interpretation);
      expect(copiedText).toContain('knowyouremoji.com');
    });
  });

  it('accepts custom className', () => {
    const { container } = render(<ShareableCard {...defaultProps} className="custom-test" />);
    expect(container.firstChild).toHaveClass('custom-test');
  });

  it('renders card with rounded corners and shadow', () => {
    render(<ShareableCard {...defaultProps} />);
    const card = screen.getByTestId('shareable-card');
    expect(card).toHaveClass('rounded-2xl', 'shadow-lg');
  });
});
