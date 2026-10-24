'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

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

    if (!token || !email) {
      setErrors({ general: 'Invalid reset link' });
      return;
    }

    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Failed to reset password' });
        return;
      }

      setResetComplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <AuthSuccess
        emoji="✅"
        title="Password updated"
        action={
          <Button
            className="w-full"
            onClick={() => {
              router.push('/login');
            }}
          >
            Sign in
          </Button>
        }
      >
        Your password has been successfully updated. You can now sign in with your new password.
      </AuthSuccess>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {errors.general && <AuthFormError>{errors.general}</AuthFormError>}

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className={authLabelClass}>
            New password
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
            placeholder="Enter your new password"
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
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className={authLabelClass}>
            Confirm new password
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
            placeholder="Confirm your new password"
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
          {isLoading ? 'Updating...' : 'Update password'}
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
