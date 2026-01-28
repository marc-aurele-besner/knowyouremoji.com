import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/header';

afterEach(() => {
  cleanup();
});

describe('Header', () => {
  it('renders the header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the logo with link to home', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /knowyouremoji/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /emojis/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /interpreter/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
  });

  it('renders mobile menu button', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Header className="custom-header" />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-header');
  });

  it('has sticky positioning classes', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
  });

  it('has appropriate z-index for layering', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('z-50');
  });

  it('toggles mobile menu visibility on button click', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });

    // Initially mobile nav should not be visible
    expect(screen.queryByTestId('mobile-nav')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(menuButton);
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();

    // Click to close
    fireEvent.click(menuButton);
    expect(screen.queryByTestId('mobile-nav')).not.toBeInTheDocument();
  });

  it('navigation links have correct hrefs', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /emojis/i })).toHaveAttribute('href', '/emoji');
    expect(screen.getByRole('link', { name: /interpreter/i })).toHaveAttribute(
      'href',
      '/interpreter'
    );
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
  });

  it('renders emoji in logo', () => {
    render(<Header />);
    const logo = screen.getByRole('link', { name: /knowyouremoji/i });
    expect(logo).toHaveTextContent('🤔');
  });

  it('hides desktop nav on small screens via class', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: /main/i });
    expect(nav).toHaveClass('hidden');
    expect(nav).toHaveClass('md:flex');
  });

  it('shows mobile menu button only on small screens via class', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toHaveClass('md:hidden');
  });
});
