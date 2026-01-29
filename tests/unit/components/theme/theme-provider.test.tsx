import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme/theme-provider';

afterEach(() => {
  cleanup();
});

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Child content</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('wraps children with next-themes provider', () => {
    render(
      <ThemeProvider>
        <p>Wrapped content</p>
      </ThemeProvider>
    );
    expect(screen.getByText('Wrapped content')).toBeInTheDocument();
  });
});
