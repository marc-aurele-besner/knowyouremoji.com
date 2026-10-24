import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

type MockSession = {
  data: { user: { name?: string | null; email?: string | null } } | null;
  status: string;
};
const sessionState: { current: MockSession } = {
  current: { data: null, status: 'unauthenticated' },
};
const signOutMock = mock(() => Promise.resolve());
mock.module('next-auth/react', () => ({
  useSession: () => sessionState.current,
  signOut: signOutMock,
}));

const { UserMenu } = await import('@/components/layout/user-menu');

const signedIn = (user: { name?: string | null; email?: string | null }) => {
  sessionState.current = { data: { user }, status: 'authenticated' };
};

afterEach(() => {
  cleanup();
  sessionState.current = { data: null, status: 'unauthenticated' };
  signOutMock.mockClear();
});

describe('UserMenu', () => {
  it('renders a placeholder while the session loads', () => {
    sessionState.current = { data: null, status: 'loading' };
    const { container } = render(<UserMenu className="extra" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild).toHaveClass('extra');
  });

  it('renders sign in and get started for guests', () => {
    render(<UserMenu />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/register');
  });

  it('shows the user initial and opens the menu', () => {
    signedIn({ name: 'jordan Lee', email: 'jordan@example.com' });
    render(<UserMenu />);
    const trigger = screen.getByRole('button', { name: 'Account menu' });
    expect(trigger).toHaveTextContent('J');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('jordan@example.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(screen.getByRole('menuitem', { name: 'History' })).toHaveAttribute(
      'href',
      '/dashboard/history'
    );
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/dashboard/settings'
    );
  });

  it('falls back to the email when there is no name', () => {
    signedIn({ name: null, email: 'zed@example.com' });
    render(<UserMenu />);
    expect(screen.getByRole('button', { name: 'Account menu' })).toHaveTextContent('Z');
  });

  it('falls back to a generic label without name or email', () => {
    signedIn({ name: null, email: null });
    render(<UserMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('closes when a menu link is clicked', () => {
    signedIn({ name: 'Jo' });
    render(<UserMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Dashboard' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('signs out from the menu', () => {
    signedIn({ name: 'Jo' });
    render(<UserMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: '/' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Escape and ignores other keys', () => {
    signedIn({ name: 'Jo' });
    render(<UserMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    fireEvent.keyDown(document, { key: 'a' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on outside click but not on inside click', () => {
    signedIn({ name: 'Jo' });
    render(
      <div>
        <p>outside</p>
        <UserMenu />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }));
    fireEvent.mouseDown(screen.getByRole('menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('toggles closed when the trigger is clicked again', () => {
    signedIn({ name: 'Jo' });
    render(<UserMenu />);
    const trigger = screen.getByRole('button', { name: 'Account menu' });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
