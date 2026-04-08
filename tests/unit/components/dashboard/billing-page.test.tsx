import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react';

const mockUseSession = mock(() => ({
  data: {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    },
  },
  status: 'authenticated' as const,
}));

mock.module('next-auth/react', () => ({
  useSession: mockUseSession,
  signOut: mock(() => Promise.resolve()),
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(() => {}) }),
}));

mock.module('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockFetch = mock(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        status: 'active',
        plan: 'pro',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        currentPeriodEnd: '2026-06-01T00:00:00.000Z',
      }),
  })
);
globalThis.fetch = mockFetch as never;

const { BillingPage } = await import('@/components/dashboard/billing-page');

beforeEach(() => {
  mockUseSession.mockReturnValue({
    data: {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      },
    },
    status: 'authenticated' as const,
  } as never);
  mockFetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'active',
          plan: 'pro',
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_123',
          currentPeriodEnd: '2026-06-01T00:00:00.000Z',
        }),
    } as never)
  );
});

afterEach(() => {
  cleanup();
  mockFetch.mockClear();
});

describe('BillingPage', () => {
  it('renders the heading', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    expect(screen.getByRole('heading', { name: /^billing$/i })).toBeInTheDocument();
  });

  it('renders description text', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    expect(
      screen.getByText(/manage your subscription, payment method, and billing details/i)
    ).toBeInTheDocument();
  });

  it('shows not available when unauthenticated', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated' as const,
    } as never);
    await act(async () => {
      render(<BillingPage />);
    });
    expect(screen.getByText(/billing not available/i)).toBeInTheDocument();
  });

  it('shows loading skeleton when session is loading', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading' as const,
    } as never);
    await act(async () => {
      render(<BillingPage />);
    });
    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('displays pro plan for active subscription', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
    });
  });

  it('displays active badge for active subscription', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('displays 100 interpretations per day for pro plan', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('100 interpretations per day')).toBeInTheDocument();
    });
  });

  it('displays next billing date for active subscription', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/next billing date/i)).toBeInTheDocument();
    });
  });

  it('shows payment method section for Stripe customers', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update payment method/i })).toBeInTheDocument();
    });
  });

  it('shows cancel subscription section for active Stripe subscriptions', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel subscription/i })).toBeInTheDocument();
    });
  });

  it('shows free plan with upgrade button when on free plan', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'free',
            plan: 'free',
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
          }),
      } as never)
    );
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /upgrade to pro/i })).toHaveAttribute(
        'href',
        '/pricing'
      );
    });
  });

  it('does not show payment method section for free plan', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'free',
            plan: 'free',
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
          }),
      } as never)
    );
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
    });
    expect(screen.queryByText('Payment Method')).not.toBeInTheDocument();
  });

  it('shows cancel confirmation when cancel button is clicked', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel subscription/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    });
    expect(screen.getByText(/are you sure you want to cancel/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm cancellation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keep subscription/i })).toBeInTheDocument();
  });

  it('dismisses cancel confirmation when keep subscription is clicked', async () => {
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel subscription/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    });
    expect(screen.getByText(/are you sure you want to cancel/i)).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /keep subscription/i }));
    });
    expect(screen.queryByText(/are you sure you want to cancel/i)).not.toBeInTheDocument();
  });

  it('cancels subscription successfully', async () => {
    let fetchCallCount = 0;
    mockFetch.mockImplementation(((url: string) => {
      fetchCallCount++;
      if (url === '/api/billing/cancel') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'active',
            plan: 'pro',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodEnd: '2026-06-01T00:00:00.000Z',
          }),
      });
    }) as never);
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel subscription/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirm cancellation/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/your subscription has been canceled/i)).toBeInTheDocument();
      expect(screen.getByText('Canceled')).toBeInTheDocument();
    });
    // Ensure the cancel endpoint was called
    expect(fetchCallCount).toBeGreaterThan(1);
  });

  it('shows error when cancel fails', async () => {
    mockFetch.mockImplementation(((url: string) => {
      if (url === '/api/billing/cancel') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Cancel failed' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'active',
            plan: 'pro',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodEnd: '2026-06-01T00:00:00.000Z',
          }),
      });
    }) as never);
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel subscription/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirm cancellation/i }));
    });
    await waitFor(() => {
      expect(screen.getByText('Cancel failed')).toBeInTheDocument();
    });
  });

  it('shows error when cancel throws', async () => {
    mockFetch.mockImplementation(((url: string) => {
      if (url === '/api/billing/cancel') {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'active',
            plan: 'pro',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodEnd: '2026-06-01T00:00:00.000Z',
          }),
      });
    }) as never);
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel subscription/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel subscription/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirm cancellation/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/failed to cancel subscription/i)).toBeInTheDocument();
    });
  });

  it('redirects to portal when update payment is clicked', async () => {
    const originalLocation = window.location;
    const mockAssign = mock(() => {});
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true,
      configurable: true,
    });

    mockFetch.mockImplementation(((url: string) => {
      if (url === '/api/billing/portal') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ url: 'https://billing.stripe.com/session/test' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'active',
            plan: 'pro',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodEnd: '2026-06-01T00:00:00.000Z',
          }),
      });
    }) as never);
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update payment method/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update payment method/i }));
    });
    await waitFor(() => {
      expect(window.location.href).toBe('https://billing.stripe.com/session/test');
    });

    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('shows error when portal redirect fails', async () => {
    mockFetch.mockImplementation(((url: string) => {
      if (url === '/api/billing/portal') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Portal error' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'active',
            plan: 'pro',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodEnd: '2026-06-01T00:00:00.000Z',
          }),
      });
    }) as never);
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update payment method/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update payment method/i }));
    });
    await waitFor(() => {
      expect(screen.getByText('Portal error')).toBeInTheDocument();
    });
  });

  it('shows error when portal redirect throws', async () => {
    mockFetch.mockImplementation(((url: string) => {
      if (url === '/api/billing/portal') {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'active',
            plan: 'pro',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodEnd: '2026-06-01T00:00:00.000Z',
          }),
      });
    }) as never);
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /update payment method/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update payment method/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/failed to open billing portal/i)).toBeInTheDocument();
    });
  });

  it('shows error when subscription fetch fails', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Fetch failed' }),
      } as never)
    );
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });

  it('shows error when subscription fetch throws', async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/failed to load subscription/i)).toBeInTheDocument();
    });
  });

  it('shows canceled badge and access until date for canceled subscription', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'canceled',
            plan: 'pro',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodEnd: '2026-06-01T00:00:00.000Z',
          }),
      } as never)
    );
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Canceled')).toBeInTheDocument();
      expect(screen.getByText(/access until/i)).toBeInTheDocument();
    });
  });

  it('shows past due badge', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'past_due',
            plan: 'pro',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodEnd: '2026-06-01T00:00:00.000Z',
          }),
      } as never)
    );
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Past Due')).toBeInTheDocument();
    });
  });

  it('has displayName set', () => {
    expect(BillingPage.displayName).toBe('BillingPage');
  });

  it('does not show cancel section for canceled subscription', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'canceled',
            plan: 'pro',
            stripeCustomerId: 'cus_123',
            stripeSubscriptionId: 'sub_123',
            currentPeriodEnd: '2026-06-01T00:00:00.000Z',
          }),
      } as never)
    );
    await act(async () => {
      render(<BillingPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Canceled')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /cancel subscription/i })).not.toBeInTheDocument();
  });

  it('shows loading skeleton while subscription is loading', async () => {
    // Create a fetch that never resolves to keep loading state
    mockFetch.mockImplementation(() => new Promise(() => {}));
    await act(async () => {
      render(<BillingPage />);
    });
    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
