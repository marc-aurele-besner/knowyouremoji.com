'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AuthFormError,
  AuthSuccess,
  OAuthButtons,
  PasswordStrength,
  authFieldErrorClass,
  authLabelClass,
  authLinkClass,
} from './auth-ui';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

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
    if (passwordValue.length < 8) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return false;
    }
    return true;
  };

  const validateConfirmPassword = (confirmValue: string, passwordValue: string): boolean => {
    if (!confirmValue) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      return false;
    }
    if (confirmValue !== passwordValue) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Registration failed' });
        return;
      }

      setRegistrationComplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    setErrors({});
    setIsLoading(true);

    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      setErrors({ general: 'Failed to sign up with provider' });
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <AuthSuccess
        emoji="📬"
        title="Check your email"
        action={
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setRegistrationComplete(false);
            }}
          >
            Back to sign up
          </Button>
        }
      >
        We sent a verification link to <strong className="text-foreground">{email}</strong>. Click
        the link in the email to verify your account.
      </AuthSuccess>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {errors.general && <AuthFormError>{errors.general}</AuthFormError>}

      <OAuthButtons onSelect={handleOAuthSignUp} disabled={isLoading} />

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <label htmlFor="password" className={authLabelClass}>
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="Create a password"
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
          <PasswordStrength password={password} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className={authLabelClass}>
            Confirm password
          </label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            placeholder="Confirm your password"
            error={!!errors.confirmPassword}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className={authFieldErrorClass}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isLoading} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      {/* Sign In Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className={authLinkClass}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
