'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  DashboardPageHeader,
  EmptyState,
  SectionCard,
  SkeletonRows,
  formErrorClass,
  formOkClass,
} from './dashboard-ui';

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
      <DashboardPageHeader
        title="Billing"
        description="Manage your subscription, payment method, and billing details."
      />

      {!isAuthenticated && !isLoading && (
        <EmptyState
          emoji="🔒"
          title="Billing Not Available"
          description="Sign in to manage your billing and subscription."
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

      {isAuthenticated && cancelSuccess && (
        <div className={formOkClass} role="status">
          Your subscription has been canceled. You will retain access until the end of your current
          billing period.
        </div>
      )}

      {(isLoading || (isAuthenticated && isLoadingSubscription)) && <SkeletonRows count={3} />}

      {isAuthenticated && !isLoadingSubscription && (
        <div className="max-w-2xl space-y-4">
          {/* Current Plan */}
          <section className="rounded-2xl border border-card-border bg-card p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="eyebrow">Current Plan</span>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {getPlanLabel(subscription?.plan ?? 'free')}
                  </h2>
                  {getStatusBadge(subscription?.status ?? 'free')}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getPlanDescription(subscription?.plan ?? 'free')}
                </p>
              </div>
              {isFree && (
                <Button variant="brand" asChild>
                  <Link href="/pricing">Upgrade to Pro</Link>
                </Button>
              )}
            </div>

            {subscription?.currentPeriodEnd && (
              <p className="mt-4 border-t border-card-border pt-4 text-sm text-muted-foreground">
                {isCanceled
                  ? `Access until ${formatDate(subscription.currentPeriodEnd)}`
                  : `Next billing date: ${formatDate(subscription.currentPeriodEnd)}`}
              </p>
            )}
          </section>

          {/* Payment Method */}
          {hasStripeSubscription && (
            <section className="rounded-2xl border border-card-border bg-card p-6 md:p-7">
              <h2 className="eyebrow">Payment Method</h2>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <span className="emoji-display text-xl" aria-hidden="true">
                    💳
                  </span>
                  Manage your payment method through the Stripe billing portal.
                </p>
                <Button
                  onClick={handleManagePayment}
                  loading={isRedirectingToPortal}
                  disabled={isRedirectingToPortal}
                >
                  {isRedirectingToPortal ? 'Redirecting...' : 'Update Payment Method'}
                </Button>
              </div>
            </section>
          )}

          {/* Cancel Subscription */}
          {isActive && hasStripeSubscription && (
            <SectionCard title="Cancel Subscription" tone="danger">
              {!showCancelConfirm ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-md text-sm text-muted-foreground">
                    Cancel your subscription. You will retain access until the end of your current
                    billing period.
                  </p>
                  <Button variant="destructive" onClick={() => setShowCancelConfirm(true)}>
                    Cancel Subscription
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={formErrorClass} role="alert">
                    Are you sure you want to cancel your subscription? You will lose access to Pro
                    features at the end of your current billing period.
                  </div>
                  <div className="flex flex-wrap gap-3">
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
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}

BillingPage.displayName = 'BillingPage';

export { BillingPage };
