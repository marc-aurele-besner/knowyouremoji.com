'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase';

interface UserProfile {
  email: string;
  displayName: string;
  createdAt: string;
}

function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => {
    setIsSupabaseReady(getSupabaseClient() !== null);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseReady) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setError('Authentication is not configured');
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('Unable to load profile');
          return;
        }

        const userProfile: UserProfile = {
          email: user.email || '',
          displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
          createdAt: user.created_at || '',
        };

        setProfile(userProfile);
        setDisplayName(userProfile.displayName);
      } catch {
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [isSupabaseReady]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError('Authentication is not configured');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSaveSuccess(true);
      if (profile) {
        setProfile({ ...profile, displayName });
      }
    } catch {
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
        window.location.href = '/';
      }
    } catch {
      setError('Failed to sign out');
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

      {!isSupabaseReady && (
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

      {isSupabaseReady && error && (
        <div
          className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      {isSupabaseReady && saveSuccess && (
        <div
          className="p-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg"
          role="status"
        >
          Profile updated successfully.
        </div>
      )}

      {isSupabaseReady && isLoading && (
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

      {isSupabaseReady && !isLoading && profile && (
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
                <Input id="email" type="email" value={profile.email} disabled />
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

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Member since {formatDate(profile.createdAt)}
              </div>

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
                <Button variant="outline" asChild>
                  <a href="/pricing">Upgrade</a>
                </Button>
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
        </>
      )}
    </div>
  );
}

SettingsPage.displayName = 'SettingsPage';

export { SettingsPage };
