import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

const mockPush = mock(() => {});
const mockUseSession = mock(() => ({
  data: {
    user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
  },
  status: 'authenticated' as const,
}));

mock.module('next-auth/react', () => ({
  useSession: mockUseSession,
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetch = mock(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ url: 'https://checkout.stripe.com/session_123' }),
  })
);
globalThis.fetch = mockFetch as never;

// Mock window.location
const originalLocation = window.location;
const mockLocationAssign = mock(() => {});

const { CheckoutButton } = await import('@/components/checkout/checkout-button');

beforeEach(() => {
  mockPush.mockClear();
  mockFetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ url: 'https://checkout.stripe.com/session_123' }),
    } as never)
  );
  mockUseSession.mockReturnValue({
    data: {
      user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
    },
    status: 'authenticated' as const,
  } as never);

  // Reset location mock
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, href: '', assign: mockLocationAssign },
  });
  mockLocationAssign.mockClear();
});

afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});

describe('CheckoutButton', () => {
  it('renders with default text', () => {
    render(<CheckoutButton />);
    expect(screen.getByRole('button', { name: 'Start Free Trial' })).toBeDefined();
  });

  it('renders with custom children', () => {
    render(<CheckoutButton>Upgrade Now</CheckoutButton>);
    expect(screen.getByRole('button', { name: 'Upgrade Now' })).toBeDefined();
  });

  it('passes extra props to Button', () => {
    render(<CheckoutButton className="w-full" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('w-full');
  });

  it('redirects to login when unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated' as const,
    } as never);

    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button'));

    expect(mockPush).toHaveBeenCalledWith('/login?callbackUrl=/pricing');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('redirects to login when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading' as const,
    } as never);

    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button'));

    expect(mockPush).toHaveBeenCalledWith('/login?callbackUrl=/pricing');
  });

  it('calls POST /api/checkout and redirects to Stripe URL on success', async () => {
    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/checkout', { method: 'POST' });
      expect(window.location.href).toBe('https://checkout.stripe.com/session_123');
    });
  });

  it('shows error when API returns error', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Stripe is not configured' }),
      } as never)
    );

    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText('Stripe is not configured')).toBeDefined();
    });
  });

  it('shows default error when API returns error without message', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      } as never)
    );

    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to start checkout')).toBeDefined();
    });
  });

  it('shows error when no URL is returned', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: null }),
      } as never)
    );

    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('No checkout URL returned')).toBeDefined();
    });
  });

  it('shows error when fetch throws', async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));

    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to start checkout')).toBeDefined();
    });
  });

  it('disables button while loading', async () => {
    // Use a promise that we can resolve manually to control timing
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockImplementation(() => pendingPromise as never);

    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });

    // Resolve to clean up
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ url: 'https://checkout.stripe.com/session_123' }),
    });
  });

  it('clears previous error on new checkout attempt', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'First error' }),
      } as never)
    );

    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeDefined();
    });

    // Now make a successful request
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/session_456' }),
      } as never)
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.queryByText('First error')).toBeNull();
    });
  });
});
