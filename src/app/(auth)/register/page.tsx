import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { getEnv } from '@/lib/env';

export async function generateMetadata(): Promise<Metadata> {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/register`;

  return {
    // The root layout applies the `%s | <siteName>` title template, so the
    // metadata title must NOT include the site name itself.
    title: 'Create Account',
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
    <AuthShell
      title="Create an account"
      description="Sign up to save your interpretation history and access premium features."
      quote="“I finally understand why my coworker’s 🙂 felt like a threat.”"
    >
      <RegisterForm />
    </AuthShell>
  );
}
