import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AuthShell } from '@/components/auth/auth-shell';
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
    <AuthShell
      title="Forgot password"
      description="Enter your email address and we'll send you a link to reset your password."
      quote="“Sent 👍 to my daughter. Apparently that was rude. This site saved me.”"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
