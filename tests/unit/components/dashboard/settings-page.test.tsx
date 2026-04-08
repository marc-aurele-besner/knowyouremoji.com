import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react';

// Mock supabase before importing component
const mockGetUser = mock((): Promise<{ data: { user: any }; error: any }> =>
  Promise.resolve({
    data: {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        created_at: '2026-01-15T10:00:00Z',
        user_metadata: { display_name: 'Test User' },
      },
    },
    error: null,
  })
);
const mockUpdateUser = mock((): Promise<{ error: any }> => Promise.resolve({ error: null }));
const mockSignOut = mock((): Promise<{ error: any }> => Promise.resolve({ error: null }));

mock.module('@/lib/supabase', () => ({
  isSupabaseConfigured: () => true,
  getSupabaseClient: () => ({
    auth: {
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
    },
  }),
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(() => {}) }),
}));

const { SettingsPage } = await import('@/components/dashboard/settings-page');

// Mock window.location
const originalLocation = globalThis.location;

beforeEach(() => {
  mockGetUser.mockImplementation(() =>
    Promise.resolve({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          created_at: '2026-01-15T10:00:00Z',
          user_metadata: { display_name: 'Test User' },
        },
      },
      error: null,
    })
  );
  mockUpdateUser.mockImplementation(() => Promise.resolve({ error: null }));
  mockSignOut.mockImplementation(() => Promise.resolve({ error: null }));

  Object.defineProperty(globalThis, 'location', {
    value: { ...originalLocation, href: '' },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  Object.defineProperty(globalThis, 'location', {
    value: originalLocation,
    writable: true,
    configurable: true,
  });
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
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: { display_name: 'Updated Name' },
      });
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error when save fails', async () => {
    mockUpdateUser.mockImplementation(() =>
      Promise.resolve({ error: { message: 'Update failed' } })
    );
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

  it('shows error when profile load fails', async () => {
    mockGetUser.mockImplementation(() =>
      Promise.resolve({ data: { user: null }, error: { message: 'Not logged in' } })
    );
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/unable to load profile/i)).toBeInTheDocument();
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
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('uses full_name fallback when display_name is not set', async () => {
    mockGetUser.mockImplementation(() =>
      Promise.resolve({
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            created_at: '2026-01-15T10:00:00Z',
            user_metadata: { full_name: 'Full Name User' },
          },
        },
        error: null,
      })
    );
    await act(async () => {
      render(<SettingsPage />);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Full Name User')).toBeInTheDocument();
    });
  });

  it('handles save throwing an exception', async () => {
    mockUpdateUser.mockImplementation(() => Promise.reject(new Error('Network error')));
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
      expect(screen.getByText(/failed to save profile/i)).toBeInTheDocument();
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
});
