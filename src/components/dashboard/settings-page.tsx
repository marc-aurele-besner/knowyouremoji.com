'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DashboardPageHeader,
  EmptyState,
  SectionCard,
  SkeletonRows,
  formErrorClass,
  formOkClass,
} from './dashboard-ui';

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

  const labelClass = 'block text-[13px] font-semibold text-foreground';

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Settings"
        description="Manage your profile and account settings."
      />

      {!isAuthenticated && !isLoading && (
        <EmptyState
          emoji="🔒"
          title="Settings Not Available"
          description="Sign in to manage your profile and settings."
          action={
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          }
        />
      )}

      {isAuthenticated && error && (
        <div className={formErrorClass} role="alert">
          {error}
        </div>
      )}

      {isAuthenticated && saveSuccess && (
        <div className={formOkClass} role="status">
          Profile updated successfully.
        </div>
      )}

      {isLoading && <SkeletonRows count={2} />}

      {isAuthenticated && !isLoading && (
        <div className="max-w-2xl space-y-4">
          {/* Profile Section */}
          <SectionCard title="Profile">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <Input id="email" type="email" value={session?.user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="displayName" className={labelClass}>
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
                <p className="text-sm text-muted-foreground">
                  Member since {formatDate(createdAt)}
                </p>
              )}

              <Button onClick={handleSaveProfile} loading={isSaving} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </SectionCard>

          {/* Subscription Section */}
          <SectionCard title="Subscription">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">Free Plan</p>
                <p className="text-sm text-muted-foreground">3 interpretations per day</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/billing">Manage Billing</Link>
                </Button>
                <Button variant="brand" size="sm" asChild>
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Account Section */}
          <SectionCard title="Account">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account on this device.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </SectionCard>

          {/* Danger Zone */}
          <SectionCard title="Danger Zone" tone="danger">
            {!showDeleteConfirm ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={formErrorClass} role="alert">
                  This action is irreversible. All your data, including interpretation history, will
                  be permanently deleted.
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="deleteConfirm" className={labelClass}>
                    Type <strong>DELETE</strong> to confirm
                  </label>
                  <Input
                    id="deleteConfirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    disabled={isDeleting}
                    className="max-w-[240px]"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
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
          </SectionCard>
        </div>
      )}
    </div>
  );
}

SettingsPage.displayName = 'SettingsPage';

export { SettingsPage };
