import { describe, it, expect, afterEach, beforeEach, spyOn } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import InterpreterError from '@/app/interpreter/error';

afterEach(() => {
  cleanup();
});

describe('InterpreterError', () => {
  const mockError = new Error('Test error message');
  const mockReset = () => {};

  beforeEach(() => {
    // Suppress console.error for cleaner test output
    spyOn(console, 'error').mockImplementation(() => {});
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

  it('logs error to console', () => {
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});
    render(<InterpreterError error={mockError} reset={mockReset} />);
    expect(consoleSpy).toHaveBeenCalledWith('Interpreter page error:', mockError);
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
