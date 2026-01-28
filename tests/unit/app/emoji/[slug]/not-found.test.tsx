import { describe, expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/emoji/[slug]/not-found';

describe('EmojiPage NotFound', () => {
  test('renders 404 message', () => {
    render(<NotFound />);

    expect(screen.getByRole('heading', { name: /emoji not found/i })).toBeInTheDocument();
  });

  test('displays helpful message', () => {
    render(<NotFound />);

    expect(screen.getByText(/couldn't find the emoji/i)).toBeInTheDocument();
  });

  test('includes link to browse emojis', () => {
    render(<NotFound />);

    const browseLink = screen.getByRole('link', { name: /browse/i });
    expect(browseLink).toBeInTheDocument();
    expect(browseLink).toHaveAttribute('href', '/');
  });

  test('includes link to interpreter', () => {
    render(<NotFound />);

    const interpreterLink = screen.getByRole('link', { name: /interpreter/i });
    expect(interpreterLink).toBeInTheDocument();
    expect(interpreterLink).toHaveAttribute('href', '/interpreter');
  });

  test('displays a friendly emoji', () => {
    render(<NotFound />);

    // Should show a confused or shrug emoji
    expect(screen.getByText(/🤷|😕|🔍/)).toBeInTheDocument();
  });
});
