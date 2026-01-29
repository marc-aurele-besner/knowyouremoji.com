import { describe, it, expect, afterEach, beforeEach, spyOn, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import InterpreterError from '@/app/interpreter/error';

// Mock the sentry module
const mockCaptureError = mock(() => undefined);
mock.module('@/lib/sentry', () => ({
  captureError: mockCaptureError,
}));

afterEach(() => {
  cleanup();
});

describe('InterpreterError', () => {
  const mockError = new Error('Test error message');
  const mockReset = () => {};

  beforeEach(() => {
    // Suppress console.error for cleaner test output
    spyOn(console, 'error').mockImplementation(() => {});
    mockCaptureError.mockClear();
  });

  it('renders error heading', () => {
    render(<InterpreterError error={mockError} reset={mockReset} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<InterpreterError error={mockError} reset={mockReset} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('renders try again button', () => {
    render(<InterpreterError error={mockError} reset={mockReset} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls reset when try again button is clicked', () => {
    let resetCalled = false;
    const reset = () => {
      resetCalled = true;
    };
    render(<InterpreterError error={mockError} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(resetCalled).toBe(true);
  });

  it('captures error with sentry', () => {
    render(<InterpreterError error={mockError} reset={mockReset} />);
    expect(mockCaptureError).toHaveBeenCalledWith(mockError, { page: 'interpreter' });
  });

  it('has container layout', () => {
    render(<InterpreterError error={mockError} reset={mockReset} />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container');
  });

  it('has maximum width constraint', () => {
    render(<InterpreterError error={mockError} reset={mockReset} />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-4xl');
  });
});
