'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          View your account information and subscription status.
        </p>
      </div>

      {!isAuthenticated && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Profile Not Available
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to view your profile information.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAuthenticated && !isLoading && (
        <>
          {/* User Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-2xl text-white">
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
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {resolvedDisplayName || 'No display name set'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                </div>
              </div>

              {createdAt && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member since {formatDate(createdAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Status Section */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Free Plan</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    3 interpretations per day
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/pricing"
                  className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  Upgrade to Pro for unlimited interpretations →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <span className="text-lg" aria-hidden="true">
                    ⚙️
                  </span>
                  Edit Profile Settings
                </Link>
                <Link
                  href="/dashboard/history"
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <span className="text-lg" aria-hidden="true">
                    📜
                  </span>
                  View Interpretation History
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

ProfilePage.displayName = 'ProfilePage';

export { ProfilePage };
