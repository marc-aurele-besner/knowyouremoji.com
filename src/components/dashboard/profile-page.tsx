'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardPageHeader, EmptyState, SectionCard, SkeletonRows } from './dashboard-ui';
import Image from 'next/image';
import Link from 'next/link';

function ProfilePage() {
  const { data: session, status } = useSession();
  const sessionName = session?.user?.name || '';
  const [displayName, setDisplayName] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const resolvedDisplayName = useMemo(() => displayName || sessionName, [displayName, sessionName]);

  useEffect(() => {
    async function fetchProfile() {
      if (!isAuthenticated) return;
      try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.displayName) setDisplayName(data.displayName);
          if (data.createdAt) setCreatedAt(data.createdAt);
        }
      } catch {
        // Profile fetch is best-effort
      }
    }
    fetchProfile();
  }, [isAuthenticated]);

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const quickLinkClass =
    'flex min-h-12 items-center gap-3 rounded-2xl border border-card-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Profile"
        description="View your account information and subscription status."
      />

      {!isAuthenticated && !isLoading && (
        <EmptyState
          emoji="🔒"
          title="Profile Not Available"
          description="Sign in to view your profile information."
          action={
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          }
        />
      )}

      {isLoading && <SkeletonRows count={3} />}

      {isAuthenticated && !isLoading && (
        <div className="max-w-2xl space-y-4">
          {/* User Info Section */}
          <SectionCard title="User Information">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={resolvedDisplayName || 'Profile'}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">
                    {(resolvedDisplayName || session?.user?.email || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">
                  {resolvedDisplayName || 'No display name set'}
                </p>
                <p className="truncate text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>

            {createdAt && (
              <p className="mt-4 border-t border-card-border pt-4 text-sm text-muted-foreground">
                Member since {formatDate(createdAt)}
              </p>
            )}
          </SectionCard>

          {/* Subscription Status Section */}
          <SectionCard title="Subscription Status">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">Free Plan</p>
                <p className="text-sm text-muted-foreground">3 interpretations per day</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="mt-4 border-t border-card-border pt-4">
              <Link
                href="/pricing"
                className="inline-flex items-center text-sm font-medium text-primary-700 hover:underline dark:text-primary-500"
              >
                Upgrade to Pro for unlimited interpretations →
              </Link>
            </div>
          </SectionCard>

          {/* Quick Links Section */}
          <SectionCard title="Quick Links">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/dashboard/settings" className={quickLinkClass}>
                <span className="emoji-display text-lg" aria-hidden="true">
                  ⚙️
                </span>
                Edit Profile Settings
              </Link>
              <Link href="/dashboard/history" className={quickLinkClass}>
                <span className="emoji-display text-lg" aria-hidden="true">
                  🕘
                </span>
                View Interpretation History
              </Link>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

ProfilePage.displayName = 'ProfilePage';

export { ProfilePage };
