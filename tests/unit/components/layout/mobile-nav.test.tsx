import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MobileNav } from '@/components/layout/mobile-nav';

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

describe('MobileNav', () => {
  const defaultProps = {
    isOpen: true,
    onClose: mock(() => {}),
  };

  it('renders when isOpen is true', () => {
    render(<MobileNav {...defaultProps} />);
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<MobileNav {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('mobile-nav')).not.toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<MobileNav {...defaultProps} />);
    expect(screen.getByRole('link', { name: /emojis/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /interpreter/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
  });

  it('navigation links have correct hrefs', () => {
    render(<MobileNav {...defaultProps} />);
    expect(screen.getByRole('link', { name: /emojis/i })).toHaveAttribute('href', '/emoji');
    expect(screen.getByRole('link', { name: /interpreter/i })).toHaveAttribute(
      'href',
      '/interpreter'
    );
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
  });

  it('calls onClose when a link is clicked', () => {
    const onClose = mock(() => {});
    render(<MobileNav isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole('link', { name: /emojis/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = mock(() => {});
    render(<MobileNav isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close menu/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders close button', () => {
    render(<MobileNav {...defaultProps} />);
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
  });

  it('has overlay backdrop', () => {
    render(<MobileNav {...defaultProps} />);
    expect(screen.getByTestId('mobile-nav-overlay')).toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = mock(() => {});
    render(<MobileNav isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('mobile-nav-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  it('has navigation element with proper aria label', () => {
    render(<MobileNav {...defaultProps} />);
    expect(screen.getByRole('navigation', { name: /mobile/i })).toBeInTheDocument();
  });

  it('applies animation classes for drawer', () => {
    render(<MobileNav {...defaultProps} />);
    const drawer = screen.getByTestId('mobile-nav-drawer');
    expect(drawer).toHaveClass('translate-x-0');
  });

  it('renders the logo in mobile nav', () => {
    render(<MobileNav {...defaultProps} />);
    const logo = screen.getByRole('link', { name: /knowyouremoji/i });
    expect(logo).toHaveAttribute('href', '/');
  });

  it('has displayName set', () => {
    expect(MobileNav.displayName).toBe('MobileNav');
  });

  it('calls onClose when logo is clicked', () => {
    const onClose = mock(() => {});
    render(<MobileNav isOpen={true} onClose={onClose} />);

    const logo = screen.getByRole('link', { name: /knowyouremoji/i });
    fireEvent.click(logo);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders emoji in logo', () => {
    render(<MobileNav {...defaultProps} />);
    const logo = screen.getByRole('link', { name: /knowyouremoji/i });
    expect(logo).toHaveTextContent('🤔');
  });

  it('renders search bar in mobile navigation', () => {
    render(<MobileNav {...defaultProps} />);
    // Search bar should be present in mobile nav
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const onClose = mock(() => {});
    render(<MobileNav isOpen onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('ignores other keys', () => {
    const onClose = mock(() => {});
    render(<MobileNav isOpen onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'a' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows sign in links for guests', () => {
    render(<MobileNav {...defaultProps} />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/register');
  });

  it('shows dashboard and sign out for signed-in users', () => {
    sessionState.current = { data: { user: { name: 'Jo' } }, status: 'authenticated' };
    const onClose = mock(() => {});
    render(<MobileNav isOpen onClose={onClose} />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onClose).toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: '/' });
  });
});
