'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface SubscriptionData {
  status: string;
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

function BillingPage() {
  const { status: sessionStatus } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isRedirectingToPortal, setIsRedirectingToPortal] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const isLoading = sessionStatus === 'loading';
  const isAuthenticated = sessionStatus === 'authenticated';

  useEffect(() => {
    async function fetchSubscription() {
      if (!isAuthenticated) return;
      setIsLoadingSubscription(true);
      try {
        const response = await fetch('/api/billing/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to load subscription');
        }
      } catch {
        setError('Failed to load subscription');
      } finally {
        setIsLoadingSubscription(false);
      }
    }
    fetchSubscription();
  }, [isAuthenticated]);

  const handleManagePayment = async () => {
    setIsRedirectingToPortal(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to open billing portal');
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Failed to open billing portal');
    } finally {
      setIsRedirectingToPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to cancel subscription');
        return;
      }

      setCancelSuccess(true);
      setShowCancelConfirm(false);
      setSubscription((prev) => (prev ? { ...prev, status: 'canceled' } : prev));
    } catch {
      setError('Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'canceled':
        return <Badge variant="warning">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'Pro Plan';
      default:
        return 'Free Plan';
    }
  };

  const getPlanDescription = (plan: string) => {
    switch (plan) {
      case 'pro':
        return '100 interpretations per day';
      default:
        return '3 interpretations per day';
    }
  };

  const hasStripeSubscription = subscription?.stripeCustomerId !== null;
  const isActive = subscription?.status === 'active';
  const isCanceled = subscription?.status === 'canceled';
  const isFree = !subscription || subscription.plan === 'free';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your subscription, payment method, and billing details.
        </p>
      </div>

      {!isAuthenticated && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Billing Not Available
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to manage your billing and subscription.
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

      {isAuthenticated && cancelSuccess && (
        <div
          className="p-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg"
          role="status"
        >
          Your subscription has been canceled. You will retain access until the end of your current
          billing period.
        </div>
      )}

      {(isLoading || (isAuthenticated && isLoadingSubscription)) && (
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

      {isAuthenticated && !isLoadingSubscription && (
        <>
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getPlanLabel(subscription?.plan ?? 'free')}
                    </p>
                    {getStatusBadge(subscription?.status ?? 'free')}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {getPlanDescription(subscription?.plan ?? 'free')}
                  </p>
                </div>
                {isFree && (
                  <Button variant="primary" asChild>
                    <Link href="/pricing">Upgrade to Pro</Link>
                  </Button>
                )}
              </div>

              {subscription?.currentPeriodEnd && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isCanceled
                      ? `Access until ${formatDate(subscription.currentPeriodEnd)}`
                      : `Next billing date: ${formatDate(subscription.currentPeriodEnd)}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          {hasStripeSubscription && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your payment method through the Stripe billing portal.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleManagePayment}
                    loading={isRedirectingToPortal}
                    disabled={isRedirectingToPortal}
                  >
                    {isRedirectingToPortal ? 'Redirecting...' : 'Update Payment Method'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancel Subscription */}
          {isActive && hasStripeSubscription && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">
                  Cancel Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showCancelConfirm ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Cancel your subscription. You will retain access until the end of your
                        current billing period.
                      </p>
                    </div>
                    <Button variant="destructive" onClick={() => setShowCancelConfirm(true)}>
                      Cancel Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg"
                      role="alert"
                    >
                      Are you sure you want to cancel your subscription? You will lose access to Pro
                      features at the end of your current billing period.
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        loading={isCanceling}
                        disabled={isCanceling}
                      >
                        {isCanceling ? 'Canceling...' : 'Confirm Cancellation'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isCanceling}
                      >
                        Keep Subscription
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

BillingPage.displayName = 'BillingPage';

export { BillingPage };
