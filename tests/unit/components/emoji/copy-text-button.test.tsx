import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { CopyTextButton } from '@/components/emoji/copy-text-button';

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

describe('CopyTextButton', () => {
  it('renders an icon-only button by default', () => {
    render(<CopyTextButton text="hello" />);
    const button = screen.getByRole('button', { name: 'Copy to clipboard' });
    expect(button).toHaveAttribute('title', 'Copy to clipboard');
    expect(button).not.toHaveTextContent('Copy');
  });

  it('renders a text pill when a label is given', () => {
    render(<CopyTextButton text="hello" label="Copy" ariaLabel="Copy meaning" />);
    expect(screen.getByRole('button', { name: 'Copy meaning' })).toHaveTextContent('Copy');
  });

  it('copies the text and shows the copied state (icon variant)', async () => {
    render(<CopyTextButton text="hello" contentType="tldr" className="extra" />);
    const button = screen.getByRole('button', { name: 'Copy to clipboard' });
    expect(button).toHaveClass('extra');
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    });
    expect(mockWriteText).toHaveBeenCalledWith('hello');
  });

  it('shows "Copied" text in the label variant', async () => {
    render(<CopyTextButton text="hi" label="Copy" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Copied');
    });
  });

  it('fails silently when the clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    render(<CopyTextButton text="hello" />);
    fireEvent.click(screen.getByRole('button'));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
  });
});
