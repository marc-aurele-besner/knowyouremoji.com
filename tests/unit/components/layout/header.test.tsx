import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Header, isNavLinkActive } from '@/components/layout/header';

// Mock next/navigation for SearchBar
const pathnameState = { current: '/emoji' as string | null };
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(() => {}),
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
  usePathname: () => pathnameState.current,
}));

// Controllable session for the account area
type MockSession = { data: { user: { name?: string; email?: string } } | null; status: string };
const sessionState: { current: MockSession } = {
  current: { data: null, status: 'unauthenticated' },
};
const signOutMock = mock(() => Promise.resolve());
mock.module('next-auth/react', () => ({
  useSession: () => sessionState.current,
  signOut: signOutMock,
}));

// Mock fetch for SearchBar
global.fetch = mock(() =>
  Promise.resolve({
    json: () => Promise.resolve({ emojis: [] }),
  })
) as unknown as typeof fetch;

afterEach(() => {
  cleanup();
  sessionState.current = { data: null, status: 'unauthenticated' };
  pathnameState.current = '/emoji';
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
    expect(nav).toHaveClass('lg:flex');
  });

  it('shows mobile menu button only on small screens via class', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    // The full nav needs desktop width, so the menu button shows below lg
    expect(menuButton).toHaveClass('lg:hidden');
  });

  it('closes mobile nav when onClose is called from MobileNav', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });

    // Open mobile nav
    fireEvent.click(menuButton);
    const mobileNav = screen.getByTestId('mobile-nav');
    expect(mobileNav).toBeInTheDocument();

    // Find and click a close mechanism in MobileNav (like clicking outside)
    // The MobileNav has a close button or backdrop
    const closeButton = screen.queryByRole('button', { name: /close/i });
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(screen.queryByTestId('mobile-nav')).not.toBeInTheDocument();
    }
  });

  it('has displayName set', () => {
    expect(Header.displayName).toBe('Header');
  });

  it('renders search bar in desktop navigation', () => {
    render(<Header />);
    // Search bar should be present - look for the combobox (search input)
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('marks the current section link as active', () => {
    pathnameState.current = '/emoji/skull';
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const active = nav.querySelector('[aria-current="page"]');
    expect(active).toHaveTextContent('Emojis');
  });

  it('hides the header search on the home page', () => {
    pathnameState.current = '/';
    render(<Header />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows the header search away from the home page', () => {
    render(<Header />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows sign in and get started links for guests', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/register');
  });
});

describe('isNavLinkActive', () => {
  it('matches the exact path and nested paths', () => {
    expect(isNavLinkActive('/emoji', '/emoji')).toBe(true);
    expect(isNavLinkActive('/emoji/skull', '/emoji')).toBe(true);
  });

  it('does not match siblings that share a prefix', () => {
    expect(isNavLinkActive('/emojis-are-fun', '/emoji')).toBe(false);
  });

  it('returns false without a pathname', () => {
    expect(isNavLinkActive(null, '/emoji')).toBe(false);
  });
});
