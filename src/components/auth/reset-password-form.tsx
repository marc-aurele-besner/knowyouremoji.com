'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Password updated
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your password has been successfully updated. You can now sign in with your new
              password.
            </p>
            <Button
              onClick={() => {
                router.push('/login');
              }}
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6 space-y-6">
        {/* General Error */}
        {errors.general && (
          <div
            className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md"
            role="alert"
          >
            {errors.general}
          </div>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              New password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your new password"
              error={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isLoading}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Confirm new password
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Confirm your new password"
              error={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={isLoading} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update password'}
          </Button>
        </form>

        {/* Back to Sign In Link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-amber-600 hover:text-amber-500 dark:text-amber-400 font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
