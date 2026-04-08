'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function SettingsPage() {
  const { data: session, status } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (session?.user?.name) {
      setDisplayName(session.user.name);
    }
  }, [session]);

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

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save profile');
        return;
      }

      setSaveSuccess(true);
    } catch {
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch {
      setError('Failed to sign out');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete account');
        return;
      }

      await signOut({ callbackUrl: '/' });
    } catch {
      setError('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your profile and account settings.
        </p>
      </div>

      {!isAuthenticated && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Settings Not Available
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to manage your profile and settings.
            </p>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && error && (
        <div
          className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      {isAuthenticated && saveSuccess && (
        <div
          className="p-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg"
          role="status"
        >
          Profile updated successfully.
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isAuthenticated && !isLoading && (
        <>
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Email
                </label>
                <Input id="email" type="email" value={session?.user?.email || ''} disabled />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email cannot be changed here.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Display Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setSaveSuccess(false);
                  }}
                  placeholder="Enter your display name"
                  disabled={isSaving}
                />
              </div>

              {createdAt && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Member since {formatDate(createdAt)}
                </div>
              )}

              <Button onClick={handleSaveProfile} loading={isSaving} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Free Plan</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    3 interpretations per day
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href="/dashboard/billing">Manage Billing</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/pricing">Upgrade</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sign Out</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sign out of your account on this device.
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Delete Account</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                    Delete Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
                    role="alert"
                  >
                    This action is irreversible. All your data, including interpretation history,
                    will be permanently deleted.
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="deleteConfirm"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Type <strong>DELETE</strong> to confirm
                    </label>
                    <Input
                      id="deleteConfirm"
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      disabled={isDeleting}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      loading={isDeleting}
                      disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

SettingsPage.displayName = 'SettingsPage';

export { SettingsPage };
