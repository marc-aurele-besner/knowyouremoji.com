import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

afterEach(() => {
  cleanup();
});

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies default badge classes', () => {
    render(<Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-full');
  });

  describe('variants', () => {
    it('applies default variant classes', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-primary-50');
      expect(badge).toHaveClass('text-primary-700');
    });

    it('applies secondary variant classes', () => {
      render(
        <Badge variant="secondary" data-testid="badge">
          Secondary
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-muted');
      expect(badge).toHaveClass('text-muted-foreground');
    });

    it('applies success variant classes', () => {
      render(
        <Badge variant="success" data-testid="badge">
          Success
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-success-background');
      expect(badge).toHaveClass('text-success');
    });

    it('applies warning variant classes', () => {
      render(
        <Badge variant="warning" data-testid="badge">
          Warning
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('ring-primary-500/30');
      expect(badge).toHaveClass('text-primary-700');
    });

    it('applies destructive variant classes', () => {
      render(
        <Badge variant="destructive" data-testid="badge">
          Error
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-danger-background');
      expect(badge).toHaveClass('text-danger');
    });

    it('applies outline variant classes', () => {
      render(
        <Badge variant="outline" data-testid="badge">
          Outline
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('border');
      expect(badge).toHaveClass('text-muted-foreground');
    });
  });

  it('merges custom className', () => {
    render(
      <Badge className="custom-class" data-testid="badge">
        Custom
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveClass('custom-class');
  });

  it('passes through HTML attributes', () => {
    render(
      <Badge data-testid="badge" id="my-badge">
        Badge
      </Badge>
    );
    expect(screen.getByTestId('badge')).toHaveAttribute('id', 'my-badge');
  });

  it('renders as div element', () => {
    render(<Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('DIV');
  });
});
