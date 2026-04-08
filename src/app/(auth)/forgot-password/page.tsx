import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { getEnv } from '@/lib/env';

export async function generateMetadata(): Promise<Metadata> {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/forgot-password`;

  return {
    title: `Forgot Password | ${env.appName}`,
    description: `Reset your ${env.appName} password. Enter your email address and we'll send you a link to reset your password.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title: `Forgot Password | ${env.appName}`,
      description: `Reset your ${env.appName} password. Enter your email address and we'll send you a link to reset your password.`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot password</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
