import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, waitFor, act } from '@testing-library/react';

// Mock next-auth/react
const mockUseSession = mock(() => ({
  data: {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
    },
  },
  status: 'authenticated' as const,
}));

mock.module('next-auth/react', () => ({
  useSession: mockUseSession,
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(() => {}) }),
}));

// Mock fetch
const mockFetch = mock(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        displayName: 'Test User',
        createdAt: '2026-01-15T10:00:00.000Z',
      }),
  })
);
globalThis.fetch = mockFetch as never;

const { ProfilePage } = await import('@/components/dashboard/profile-page');

beforeEach(() => {
  mockUseSession.mockReturnValue({
    data: {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
      },
    },
    status: 'authenticated' as const,
  } as never);
  mockFetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          displayName: 'Test User',
          createdAt: '2026-01-15T10:00:00.000Z',
        }),
    } as never)
  );
});

afterEach(() => {
  cleanup();
  mockFetch.mockClear();
});

describe('ProfilePage', () => {
  it('renders the heading', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    expect(screen.getByRole('heading', { name: /^profile$/i })).toBeInTheDocument();
  });

  it('renders description text', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    expect(
      screen.getByText(/view your account information and subscription status/i)
    ).toBeInTheDocument();
  });

  it('displays user email', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('displays user display name', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('displays member since date', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/member since/i)).toBeInTheDocument();
    });
  });

  it('displays subscription status', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/free plan/i)).toBeInTheDocument();
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
  });

  it('displays interpretations per day', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/3 interpretations per day/i)).toBeInTheDocument();
    });
  });

  it('renders upgrade link', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /upgrade to pro for unlimited/i })).toHaveAttribute(
        'href',
        '/pricing'
      );
    });
  });

  it('renders settings quick link', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /edit profile settings/i })).toHaveAttribute(
        'href',
        '/dashboard/settings'
      );
    });
  });

  it('renders history quick link', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /view interpretation history/i })).toHaveAttribute(
        'href',
        '/dashboard/history'
      );
    });
  });

  it('shows loading skeleton when session is loading', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading' as const,
    } as never);
    await act(async () => {
      render(<ProfilePage />);
    });
    const pulseElements = document.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('shows not available when unauthenticated', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated' as const,
    } as never);
    await act(async () => {
      render(<ProfilePage />);
    });
    expect(screen.getByText(/profile not available/i)).toBeInTheDocument();
  });

  it('shows sign in message when unauthenticated', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated' as const,
    } as never);
    await act(async () => {
      render(<ProfilePage />);
    });
    expect(screen.getByText(/sign in to view your profile information/i)).toBeInTheDocument();
  });

  it('shows avatar initial when no image', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  it('shows profile image when user has image', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
        },
      },
      status: 'authenticated' as const,
    } as never);
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      const img = screen.getByAltText('Test User');
      expect(img).toBeInTheDocument();
      expect(img.getAttribute('src')).toContain('avatar.jpg');
    });
  });

  it('shows fallback text when no display name is set', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: '',
          image: null,
        },
      },
      status: 'authenticated' as const,
    } as never);
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            displayName: '',
            createdAt: '2026-01-15T10:00:00.000Z',
          }),
      } as never)
    );
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/no display name set/i)).toBeInTheDocument();
    });
  });

  it('fetches profile data on mount', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/profile');
    });
  });

  it('handles profile fetch failure gracefully', async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')) as never);
    await act(async () => {
      render(<ProfilePage />);
    });
    // Should still render the page without crashing
    expect(screen.getByRole('heading', { name: /^profile$/i })).toBeInTheDocument();
  });

  it('handles profile fetch returning non-ok response', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      } as never)
    );
    await act(async () => {
      render(<ProfilePage />);
    });
    // Should still render with session data
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders user info section heading', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/user information/i)).toBeInTheDocument();
    });
  });

  it('renders subscription status section heading', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /subscription status/i })).toBeInTheDocument();
    });
  });

  it('renders quick links section heading', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/quick links/i)).toBeInTheDocument();
    });
  });

  it('has displayName set', () => {
    expect(ProfilePage.displayName).toBe('ProfilePage');
  });

  it('uses email initial when no name and no display name', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: '',
          image: null,
        },
      },
      status: 'authenticated' as const,
    } as never);
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            displayName: '',
            createdAt: '2026-01-15T10:00:00.000Z',
          }),
      } as never)
    );
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });

  it('does not fetch profile when unauthenticated', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated' as const,
    } as never);
    await act(async () => {
      render(<ProfilePage />);
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not show member since when createdAt is not available', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            displayName: 'Test User',
          }),
      } as never)
    );
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    expect(screen.queryByText(/member since/i)).not.toBeInTheDocument();
  });
});
