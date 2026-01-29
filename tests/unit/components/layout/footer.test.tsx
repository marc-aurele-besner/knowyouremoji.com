import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Footer } from '@/components/layout/footer';

// Mock analytics
const mockExternalLinkClick = mock(() => {});
mock.module('@/lib/analytics', () => ({
  engagementEvents: {
    externalLinkClick: mockExternalLinkClick,
  },
}));

afterEach(() => {
  cleanup();
});

describe('Footer', () => {
  it('renders the footer element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders copyright notice', () => {
    render(<Footer />);
    expect(screen.getByText(/© \d{4} KnowYourEmoji/)).toBeInTheDocument();
  });

  it('renders current year in copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /emojis/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /interpreter/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /privacy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /terms/i })).toBeInTheDocument();
  });

  it('navigation links have correct hrefs', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /emojis/i })).toHaveAttribute('href', '/emoji');
    expect(screen.getByRole('link', { name: /interpreter/i })).toHaveAttribute(
      'href',
      '/interpreter'
    );
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
  });

  it('legal links have correct hrefs', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: /terms/i })).toHaveAttribute('href', '/terms');
  });

  it('applies custom className', () => {
    render(<Footer className="custom-footer" />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('custom-footer');
  });

  it('has appropriate styling classes', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('border-t');
  });

  it('renders the logo in footer', () => {
    render(<Footer />);
    const logo = screen.getByRole('link', { name: /knowyouremoji/i });
    expect(logo).toHaveAttribute('href', '/');
    expect(logo).toHaveTextContent('🤔');
  });

  it('has section headings for link groups', () => {
    render(<Footer />);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('has displayName set', () => {
    expect(Footer.displayName).toBe('Footer');
  });

  it('renders description text', () => {
    render(<Footer />);
    expect(screen.getByText(/understand what emojis really mean/i)).toBeInTheDocument();
  });

  it('renders GitHub link to upstream repository', () => {
    render(<Footer />);
    const githubLink = screen.getByRole('link', { name: /open source on github/i });
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/marc-aurele-besner/knowyouremoji.com'
    );
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('tracks external link click on GitHub link', () => {
    render(<Footer />);
    const githubLink = screen.getByRole('link', { name: /open source on github/i });

    fireEvent.click(githubLink);

    expect(mockExternalLinkClick).toHaveBeenCalledWith(
      'https://github.com/marc-aurele-besner/knowyouremoji.com',
      'Open Source on GitHub'
    );
  });
});
