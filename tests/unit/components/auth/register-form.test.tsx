import { describe, it, expect, mock, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { RegisterForm } from '@/components/auth/register-form';

// Type for Supabase auth response
interface AuthResponse {
  data: { user?: { id: string } } | null;
  error: { message: string } | null;
}

// Mock the supabase module - use type assertion for Bun's mock
const mockSignUp = mock(() => Promise.resolve({ data: null, error: null } as AuthResponse));
const mockSignInWithOAuth = mock(() =>
  Promise.resolve({ data: null, error: null } as AuthResponse)
);

mock.module('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      signUp: mockSignUp,
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
  mockSignUp.mockClear();
  mockSignInWithOAuth.mockClear();
  mockPush.mockClear();
});

describe('RegisterForm', () => {
  describe('rendering', () => {
    it('renders the registration form with email input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    });

    it('renders the registration form with password input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('renders the registration form with confirm password input', () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders the create account submit button', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
    });

    it('renders link to login page', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('shows error when email is empty on submit', async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is empty on submit', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when confirm password is empty on submit', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));
      await waitFor(() => {
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      render(<RegisterForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const form = emailInput.closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockSignUp).not.toHaveBeenCalled();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'short' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'short' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password456' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('email/password registration', () => {
    it('calls signUp with correct credentials', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback'),
          },
        });
      });
    });

    it('shows loading state during registration', async () => {
      mockSignUp.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null }), 100))
      );
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
      });
    });

    it('shows error message on registration failure', async () => {
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' },
      });
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
      });
    });

    it('shows email verification message on successful registration', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      });
    });

    it('can return to registration form from success message', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /back to sign up/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^create account$/i })).toBeInTheDocument();
      });
    });
  });

  describe('OAuth sign up', () => {
    it('calls signInWithOAuth for Google', async () => {
      render(<RegisterForm />);
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
      render(<RegisterForm />);
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
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

      await waitFor(() => {
        expect(screen.getByText(/oauth error/i)).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible form labels', () => {
      render(<RegisterForm />);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('uses aria-describedby for error messages', async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/^email$/i);
        expect(emailInput).toHaveAttribute('aria-describedby');
      });
    });

    it('displays error in accessible alert role', async () => {
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'Test error' },
      });
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/test error/i);
      });
    });
  });

  describe('error clearing', () => {
    it('clears email error when typing', async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 't' },
      });

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });

    it('clears password error when typing', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'p' },
      });

      await waitFor(() => {
        expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
      });
    });

    it('clears confirm password error when typing', async () => {
      render(<RegisterForm />);
      fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /^create account$/i }));

      await waitFor(() => {
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'p' },
      });

      await waitFor(() => {
        expect(screen.queryByText(/please confirm your password/i)).not.toBeInTheDocument();
      });
    });
  });
});
