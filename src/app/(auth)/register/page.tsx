import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import { getEnv } from '@/lib/env';

export async function generateMetadata(): Promise<Metadata> {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/register`;

  return {
    title: `Create Account | ${env.appName}`,
    description: `Create your ${env.appName} account to save your interpretation history, access premium features, and personalize your emoji experience.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title: `Create Account | ${env.appName}`,
      description: `Create your ${env.appName} account to save your interpretation history, access premium features, and personalize your emoji experience.`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create an account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign up to save your interpretation history and access premium features.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
