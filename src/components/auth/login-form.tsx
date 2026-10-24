'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AuthFormError,
  AuthSuccess,
  OAuthButtons,
  authFieldErrorClass,
  authLabelClass,
  authLinkClass,
} from './auth-ui';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

type AuthMode = 'password' | 'magic-link';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('password');

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(emailValue);
    if (!isValidFormat) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
      return false;
    }
    return true;
  };

  const validatePassword = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    return true;
  };

  const handleEmailPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Invalid email or password' });
        return;
      }

      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Failed to send magic link' });
        return;
      }

      setMagicLinkSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setErrors({});
    setIsLoading(true);

    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      setErrors({ general: 'Failed to sign in with provider' });
      setIsLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <AuthSuccess
        emoji="📬"
        title="Check your email"
        action={
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setMagicLinkSent(false);
              setAuthMode('password');
            }}
          >
            Back to sign in
          </Button>
        }
      >
        We sent a magic link to <strong className="text-foreground">{email}</strong>. Click the link
        in the email to sign in.
      </AuthSuccess>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {errors.general && <AuthFormError>{errors.general}</AuthFormError>}

      <OAuthButtons onSelect={handleOAuthSignIn} disabled={isLoading} />

      {/* Email/Password Form */}
      {authMode === 'password' && (
        <form onSubmit={handleEmailPasswordSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className={authLabelClass}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="you@example.com"
              error={!!errors.email}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isLoading}
            />
            {errors.email && (
              <p id="email-error" className={authFieldErrorClass}>
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={authLabelClass}>
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your password"
              error={!!errors.password}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isLoading}
            />
            {errors.password && (
              <p id="password-error" className={authFieldErrorClass}>
                {errors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      )}

      {/* Magic Link Form */}
      {authMode === 'magic-link' && (
        <form onSubmit={handleMagicLinkSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label htmlFor="magic-email" className={authLabelClass}>
              Email
            </label>
            <Input
              id="magic-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="you@example.com"
              error={!!errors.email}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'magic-email-error' : undefined}
              disabled={isLoading}
            />
            {errors.email && (
              <p id="magic-email-error" className={authFieldErrorClass}>
                {errors.email}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send magic link'}
          </Button>
        </form>
      )}

      {/* Toggle Auth Mode */}
      <button
        type="button"
        className="mx-auto min-h-10 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        onClick={() => setAuthMode(authMode === 'password' ? 'magic-link' : 'password')}
      >
        {authMode === 'password'
          ? 'Sign in with magic link instead'
          : 'Sign in with password instead'}
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className={authLinkClass}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
