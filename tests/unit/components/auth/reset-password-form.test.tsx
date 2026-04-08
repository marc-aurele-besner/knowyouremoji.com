import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

// Type for Supabase auth response
interface AuthResponse {
  data: unknown;
  error: { message: string } | null;
}

// Mock the supabase module
const mockUpdateUser = mock(() => Promise.resolve({ data: null, error: null } as AuthResponse));

mock.module('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
  isSupabaseConfigured: () => true,
}));

// Mock next/navigation
const mockPush = mock(() => {});
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}));

afterEach(() => {
  cleanup();
  mockUpdateUser.mockClear();
  mockPush.mockClear();
});

describe('ResetPasswordForm', () => {
  describe('rendering', () => {
    it('renders the form with new password input', () => {
      render(<ResetPasswordForm />);
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    });

    it('renders the form with confirm password input', () => {
      render(<ResetPasswordForm />);
      expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument();
    });

    it('renders the update password button', () => {
      render(<ResetPasswordForm />);
      expect(screen.getByRole('button', { name: /^update password$/i })).toBeInTheDocument();
    });

    it('renders link to sign in page', () => {
      render(<ResetPasswordForm />);
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('shows error when password is empty on submit', async () => {
      render(<ResetPasswordForm />);
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'short' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'short' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('shows error when confirm password is empty on submit', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));
      await waitFor(() => {
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'password456' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('password update', () => {
    it('calls updateUser with correct password', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          password: 'newpassword123',
        });
      });
    });

    it('shows loading state during submission', async () => {
      mockUpdateUser.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 100))
      );
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();
      });
    });

    it('shows error message on failure', async () => {
      mockUpdateUser.mockResolvedValue({
        data: null,
        error: { message: 'Password too weak' },
      });
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password too weak/i)).toBeInTheDocument();
      });
    });

    it('shows success message after password update', async () => {
      mockUpdateUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null });
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password updated/i)).toBeInTheDocument();
      });
    });

    it('redirects to login from success message', async () => {
      mockUpdateUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null });
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password updated/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible form labels', () => {
      render(<ResetPasswordForm />);
      const passwordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/^confirm new password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('uses aria-describedby for error messages', async () => {
      render(<ResetPasswordForm />);
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/^new password$/i);
        expect(passwordInput).toHaveAttribute('aria-describedby');
      });
    });

    it('displays error in accessible alert role', async () => {
      mockUpdateUser.mockResolvedValue({
        data: null,
        error: { message: 'Test error' },
      });
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/test error/i);
      });
    });
  });

  describe('error clearing', () => {
    it('clears password error when typing', async () => {
      render(<ResetPasswordForm />);
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'p' },
      });

      await waitFor(() => {
        expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
      });
    });

    it('clears confirm password error when typing', async () => {
      render(<ResetPasswordForm />);
      fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^update password$/i }));

      await waitFor(() => {
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
        target: { value: 'p' },
      });

      await waitFor(() => {
        expect(screen.queryByText(/please confirm your password/i)).not.toBeInTheDocument();
      });
    });
  });
});
