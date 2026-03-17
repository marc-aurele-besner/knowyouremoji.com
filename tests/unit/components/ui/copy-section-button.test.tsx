import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { CopySectionButton } from '@/components/ui/copy-section-button';

const mockWriteText = mock(() => Promise.resolve());

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  mockWriteText.mockClear();
});

describe('CopySectionButton', () => {
  it('renders copy button', () => {
    render(<CopySectionButton text="Hello world" />);
    expect(screen.getByRole('button', { name: /copy to clipboard/i })).toBeInTheDocument();
  });

  it('copies text to clipboard when clicked', async () => {
    render(<CopySectionButton text="Hello world" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Hello world');
    });
  });

  it('shows checkmark after successful copy', async () => {
    render(<CopySectionButton text="Hello world" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    });
  });

  it('reverts to copy icon after timeout', async () => {
    render(<CopySectionButton text="Hello world" />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /copy to clipboard/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('accepts custom className', () => {
    render(<CopySectionButton text="test" className="custom-class" />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('handles clipboard API not available', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<CopySectionButton text="test" />);
    // Should not throw
    fireEvent.click(screen.getByRole('button'));

    // Button should still be in initial state
    expect(screen.getByRole('button', { name: /copy to clipboard/i })).toBeInTheDocument();
  });
});
