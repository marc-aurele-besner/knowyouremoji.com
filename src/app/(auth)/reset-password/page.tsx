import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { getEnv } from '@/lib/env';

export async function generateMetadata(): Promise<Metadata> {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/reset-password`;

  return {
    title: `Reset Password | ${env.appName}`,
    description: `Set a new password for your ${env.appName} account.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title: `Reset Password | ${env.appName}`,
      description: `Set a new password for your ${env.appName} account.`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      description="Enter your new password below."
      quote="“I finally understand why my coworker’s 🙂 felt like a threat.”"
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
