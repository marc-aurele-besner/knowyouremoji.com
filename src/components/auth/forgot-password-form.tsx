'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AuthFormError,
  AuthSuccess,
  authFieldErrorClass,
  authLabelClass,
  authLinkClass,
} from './auth-ui';

interface FormErrors {
  email?: string;
  general?: string;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Failed to send reset email' });
        return;
      }

      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthSuccess
        emoji="📬"
        title="Check your email"
        action={
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setEmailSent(false);
            }}
          >
            Try a different email
          </Button>
        }
      >
        We sent a password reset link to <strong className="text-foreground">{email}</strong>. Click
        the link in the email to reset your password.
      </AuthSuccess>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {errors.general && <AuthFormError>{errors.general}</AuthFormError>}

      {/* Forgot Password Form */}
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

        <Button type="submit" size="lg" className="w-full" loading={isLoading} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      {/* Back to Sign In Link */}
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className={authLinkClass}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
