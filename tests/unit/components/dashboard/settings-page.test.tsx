import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react';

// Mock next-auth/react
const mockSignOut = mock(() => Promise.resolve());
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
  signOut: mockSignOut,
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

const { SettingsPage } = await import('@/components/dashboard/settings-page');

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
          displayName: 'Test User',
          createdAt: '2026-01-15T10:00:00.000Z',
        }),
    } as never)
  );
  mockSignOut.mockImplementation(() => Promise.resolve());
});

afterEach(() => {
  cleanup();
  mockFetch.mockClear();
  mockSignOut.mockClear();
});

describe('SettingsPage', () => {
  it('renders the heading', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
  });

  it('renders description text', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    expect(screen.getByText(/manage your profile and account settings/i)).toBeInTheDocument();
  });

  it('displays user email', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
  });

  it('email field is disabled', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      const emailInput = screen.getByDisplayValue('test@example.com');
      expect(emailInput).toBeDisabled();
    });
  });

  it('displays user display name', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
  });

  it('displays member since date', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/member since/i)).toBeInTheDocument();
    });
  });

  it('renders save changes button', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  it('renders sign out button', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });
  });

  it('renders subscription section with free plan', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/free plan/i)).toBeInTheDocument();
    });
  });

  it('renders upgrade link', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /upgrade/i })).toHaveAttribute('href', '/pricing');
    });
  });

  it('allows editing display name', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
  });

  it('saves profile changes successfully', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'Updated Name' }),
      });
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error when save fails', async () => {
    mockFetch.mockImplementation(((url: string) => {
      if (url === '/api/auth/update-profile') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Update failed' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ displayName: 'Test User', createdAt: '2026-01-15T10:00:00.000Z' }),
      });
    }) as never);
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('handles sign out', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    });
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
    });
  });

  it('handles sign out error', async () => {
    mockSignOut.mockImplementation(() => Promise.reject(new Error('Sign out failed')));
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/failed to sign out/i)).toBeInTheDocument();
    });
  });

  it('has displayName set', () => {
    expect(SettingsPage.displayName).toBe('SettingsPage');
  });

  it('clears success message when name is edited after save', async () => {
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Changed' } });
    expect(screen.queryByText(/profile updated successfully/i)).not.toBeInTheDocument();
  });

  it('shows not available when unauthenticated', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated' as const,
    } as never);
    await act(async () => {
      render(<SettingsPage />);
    });
    expect(screen.getByText(/settings not available/i)).toBeInTheDocument();
  });
});
