import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ShareMeaningButton } from '@/components/share/share-meaning-button';

const mockWriteText = mock(() => Promise.resolve());

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
  // Ensure navigator.share is not available by default
  Object.defineProperty(navigator, 'share', {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  mockWriteText.mockClear();
});

describe('ShareMeaningButton', () => {
  const defaultProps = {
    emoji: '🔥',
    context: 'Slang',
    meaning: 'Something is impressive or excellent',
    slug: 'fire',
    index: 0,
  };

  it('renders share button', () => {
    render(<ShareMeaningButton {...defaultProps} />);
    expect(screen.getByRole('button', { name: /share slang meaning/i })).toBeInTheDocument();
  });

  it('copies text to clipboard when navigator.share is not available', async () => {
    render(<ShareMeaningButton {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
      const text = (mockWriteText.mock.calls[0] as string[])[0];
      expect(text).toContain('🔥');
      expect(text).toContain('Slang');
      expect(text).toContain('Something is impressive');
    });
  });

  it('uses navigator.share when available', async () => {
    const mockShare = mock(() => Promise.resolve());
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareMeaningButton {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalled();
    });

    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it('accepts custom className', () => {
    render(<ShareMeaningButton {...defaultProps} className="custom" />);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });

  it('handles share failure gracefully', async () => {
    const mockShare = mock(() => Promise.reject(new Error('cancelled')));
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareMeaningButton {...defaultProps} />);
    const button = screen.getByRole('button');

    // Should not throw
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalled();
    });

    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });
});
