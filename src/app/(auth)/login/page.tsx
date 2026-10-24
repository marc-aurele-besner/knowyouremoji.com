import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { AuthShell } from '@/components/auth/auth-shell';
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
    <AuthShell
      title="Sign in"
      description="Sign in to your account to access your interpretation history and premium features."
      quote="“Sent 👍 to my daughter. Apparently that was rude. This site saved me.”"
    >
      <LoginForm />
    </AuthShell>
  );
}
