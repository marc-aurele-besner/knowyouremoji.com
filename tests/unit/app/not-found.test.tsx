import { describe, expect, test, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('Global NotFound (404 Page)', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders 404 heading', () => {
    render(<NotFound />);

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  test('displays 404 status prominently', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  test('displays helpful message', () => {
    render(<NotFound />);

    expect(screen.getByText(/the page you're looking for doesn't exist/i)).toBeInTheDocument();
  });

  test('displays a friendly emoji', () => {
    render(<NotFound />);

    // Should show a confused/shrug emoji
    expect(screen.getByRole('img', { name: /confused/i })).toBeInTheDocument();
  });

  test('includes link to homepage', () => {
    render(<NotFound />);

    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('includes link to interpreter', () => {
    render(<NotFound />);

    const interpreterLink = screen.getByRole('link', { name: /try the interpreter/i });
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

  test('displays emoji grid when emojis are available', () => {
    render(<NotFound />);

    // Should display emoji results
    expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
  });

  test('displays quick links section', () => {
    render(<NotFound />);

    // Should have quick links to common pages
    expect(screen.getByRole('heading', { name: /popular pages/i })).toBeInTheDocument();
  });

  test('includes homepage card in popular pages', () => {
    render(<NotFound />);

    expect(screen.getByText('Homepage')).toBeInTheDocument();
    expect(screen.getByText('Browse all emojis')).toBeInTheDocument();
  });

  test('includes interpreter card in popular pages', () => {
    render(<NotFound />);

    expect(screen.getByText('Interpreter')).toBeInTheDocument();
    expect(screen.getByText('Decode emoji messages')).toBeInTheDocument();
  });

  test('includes about card in popular pages', () => {
    render(<NotFound />);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Learn about us')).toBeInTheDocument();
  });
});
