import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/login-form';

// Type for Supabase auth response
interface AuthResponse {
  data: { user?: { id: string } } | null;
  error: { message: string } | null;
}

// Mock the supabase module - use type assertion for Bun's mock
const mockSignInWithPassword = mock(() =>
  Promise.resolve({ data: null, error: null } as AuthResponse)
);
const mockSignInWithOtp = mock(() => Promise.resolve({ data: null, error: null } as AuthResponse));
const mockSignInWithOAuth = mock(() =>
  Promise.resolve({ data: null, error: null } as AuthResponse)
);

mock.module('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOtp: mockSignInWithOtp,
      signInWithOAuth: mockSignInWithOAuth,
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
  mockSignInWithPassword.mockClear();
  mockSignInWithOtp.mockClear();
  mockSignInWithOAuth.mockClear();
  mockPush.mockClear();
});

describe('LoginForm', () => {
  describe('rendering', () => {
    it('renders the login form with email input', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    });

    it('renders the login form with password input', () => {
      render(<LoginForm />);
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders the sign in submit button', () => {
      render(<LoginForm />);
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('renders the forgot password link', () => {
      render(<LoginForm />);
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
      render(<LoginForm />);
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
    });

    it('renders magic link toggle option', () => {
      render(<LoginForm />);
      expect(
        screen.getByRole('button', { name: /sign in with magic link instead/i })
      ).toBeInTheDocument();
    });

    it('renders link to registration page', () => {
      render(<LoginForm />);
      expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('shows error when email is empty on submit', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is empty on submit', async () => {
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      render(<LoginForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Set values and verify they're applied
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(emailInput).toHaveValue('invalid-email');
      expect(passwordInput).toHaveValue('password123');

      // Submit the form
      const form = emailInput.closest('form');
      fireEvent.submit(form!);

      // Validation should prevent API call and show error
      await waitFor(() => {
        expect(mockSignInWithPassword).not.toHaveBeenCalled();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('email/password sign in', () => {
    it('calls signInWithPassword with correct credentials', async () => {
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('shows loading state during sign in', async () => {
      mockSignInWithPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 100))
      );
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
      });
    });

    it('shows error message on sign in failure', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('redirects to dashboard on successful sign in', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('magic link sign in', () => {
    it('shows magic link form when toggle is clicked', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });
    });

    it('calls signInWithOtp with email for magic link', async () => {
      render(<LoginForm />);
      // Switch to magic link mode
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(mockSignInWithOtp).toHaveBeenCalledWith({
          email: 'test@example.com',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback'),
          },
        });
      });
    });

    it('shows success message after magic link sent', async () => {
      mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });
      render(<LoginForm />);
      // Switch to magic link mode
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    it('shows error when magic link fails', async () => {
      mockSignInWithOtp.mockResolvedValue({
        data: null,
        error: { message: 'Rate limit exceeded' },
      });
      render(<LoginForm />);
      // Switch to magic link mode
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument();
      });
    });

    it('requires email for magic link', async () => {
      render(<LoginForm />);
      // Switch to magic link mode
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('can toggle back to password mode', async () => {
      render(<LoginForm />);
      // Switch to magic link mode
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /sign in with password instead/i })
        ).toBeInTheDocument();
      });

      // Switch back to password mode
      fireEvent.click(screen.getByRole('button', { name: /sign in with password instead/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      });
    });

    it('can return to sign in from magic link success', async () => {
      mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });
      render(<LoginForm />);
      // Switch to magic link mode
      fireEvent.click(screen.getByRole('button', { name: /sign in with magic link instead/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });

      // Click back to sign in
      fireEvent.click(screen.getByRole('button', { name: /back to sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
      });
    });
  });

  describe('OAuth sign in', () => {
    it('calls signInWithOAuth for Google', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        });
      });
    });

    it('calls signInWithOAuth for GitHub', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /continue with github/i }));

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'github',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        });
      });
    });

    it('shows error when OAuth fails', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth error' },
      });
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(screen.getByText(/oauth error/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible form labels', () => {
      render(<LoginForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/password/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('uses aria-describedby for error messages', async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/^email$/i);
        expect(emailInput).toHaveAttribute('aria-describedby');
      });
    });

    it('displays error in accessible alert role', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Test error' },
      });
      render(<LoginForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/test error/i);
      });
    });
  });
});
