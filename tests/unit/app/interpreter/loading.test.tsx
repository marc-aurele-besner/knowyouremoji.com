import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import InterpreterLoading from '@/app/interpreter/loading';

afterEach(() => {
  cleanup();
});

describe('InterpreterLoading', () => {
  it('renders loading state', () => {
    render(<InterpreterLoading />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders skeleton elements', () => {
    const { container } = render(<InterpreterLoading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has container layout', () => {
    render(<InterpreterLoading />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container');
  });

  it('has maximum width constraint', () => {
    render(<InterpreterLoading />);
    const main = screen.getByRole('main');
    expect(main).toHaveClass('max-w-4xl');
  });
});
