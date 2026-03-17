import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { SharedInterpretationView } from '@/components/interpreter/shared-interpretation-view';
import type { SharedInterpretation } from '@/lib/share-encoding';

afterEach(() => {
  cleanup();
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

  it('renders interpretation text', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByText(mockData.interpretation)).toBeInTheDocument();
  });

  it('renders original message', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByText(mockData.message)).toBeInTheDocument();
  });

  it('renders tone badge', () => {
    render(<SharedInterpretationView data={mockData} />);
    const badge = screen.getByTestId('shared-tone-badge');
    expect(badge).toHaveTextContent('Positive');
    expect(badge).toHaveClass('bg-green-100');
  });

  it('renders negative tone badge', () => {
    render(<SharedInterpretationView data={{ ...mockData, tone: 'negative' }} />);
    const badge = screen.getByTestId('shared-tone-badge');
    expect(badge).toHaveTextContent('Negative');
    expect(badge).toHaveClass('bg-red-100');
  });

  it('renders neutral tone badge', () => {
    render(<SharedInterpretationView data={{ ...mockData, tone: 'neutral' }} />);
    const badge = screen.getByTestId('shared-tone-badge');
    expect(badge).toHaveTextContent('Neutral');
  });

  it('renders confidence level', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByText('85% confident')).toBeInTheDocument();
  });

  it('renders sarcasm meter', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByTestId('shared-sarcasm-meter')).toBeInTheDocument();
  });

  it('renders passive-aggression meter', () => {
    render(<SharedInterpretationView data={mockData} />);
    expect(screen.getByTestId('passive-aggression-meter')).toBeInTheDocument();
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
});
