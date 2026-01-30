import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { getEnv } from '@/lib/env';

export async function generateMetadata(): Promise<Metadata> {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/login`;

  return {
    title: `Sign In | ${env.appName}`,
    description: `Sign in to your ${env.appName} account to access your interpretation history, saved preferences, and premium features.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title: `Sign In | ${env.appName}`,
      description: `Sign in to your ${env.appName} account to access your interpretation history, saved preferences, and premium features.`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign in</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign in to your account to access your interpretation history and premium features.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
