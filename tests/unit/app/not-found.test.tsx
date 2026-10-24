import { describe, expect, test, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('Global NotFound (404 Page)', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders 404 heading', () => {
    render(<NotFound />);

    expect(
      screen.getByRole('heading', { level: 1, name: /this page melted away/i })
    ).toBeInTheDocument();
  });

  test('displays 404 status prominently', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  test('displays helpful message', () => {
    render(<NotFound />);

    expect(screen.getByText(/we couldn't find what you were looking for/i)).toBeInTheDocument();
  });

  test('displays a friendly emoji', () => {
    render(<NotFound />);

    // Should show the melting face emoji
    expect(screen.getByRole('img', { name: /melting face/i })).toBeInTheDocument();
  });

  test('includes link to homepage', () => {
    render(<NotFound />);

    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('includes link to interpreter', () => {
    render(<NotFound />);

    const interpreterLink = screen.getByRole('link', { name: /open interpreter/i });
    expect(interpreterLink).toBeInTheDocument();
    expect(interpreterLink).toHaveAttribute('href', '/interpreter');
  });

  test('includes search functionality section', () => {
    render(<NotFound />);

    // Should have a search input
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  test('displays search placeholder text', () => {
    render(<NotFound />);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('placeholder', expect.stringContaining('Search'));
  });

  test('shows no result grid until the visitor searches', () => {
    render(<NotFound />);

    expect(screen.queryByRole('list', { name: /emoji results/i })).toBeNull();
  });

  test('displays emoji grid once the visitor searches', () => {
    render(<NotFound />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'skull' } });
    expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
  });

  test('displays popular emoji chips linking to emoji pages', () => {
    render(<NotFound />);

    const nav = screen.getByRole('navigation', { name: /popular emojis/i });
    const links = nav.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
    expect(nav.querySelector('a[href="/emoji/skull"]')).not.toBeNull();
  });
});
