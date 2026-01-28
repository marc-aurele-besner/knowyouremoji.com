import { describe, expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import Loading from '@/app/emoji/[slug]/loading';

describe('EmojiPage Loading', () => {
  test('renders loading skeleton', () => {
    render(<Loading />);

    // Check for skeleton elements
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('has accessible loading state', () => {
    render(<Loading />);

    // Check for loading indicator role or aria-label
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  test('displays placeholder for emoji character', () => {
    render(<Loading />);

    // Should have a large skeleton for emoji
    const emojiSkeleton = screen.getByTestId('emoji-skeleton');
    expect(emojiSkeleton).toBeInTheDocument();
  });

  test('displays placeholder for content sections', () => {
    render(<Loading />);

    // Should have skeletons for main content areas
    expect(screen.getByTestId('title-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('tldr-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('content-skeleton')).toBeInTheDocument();
  });
});
