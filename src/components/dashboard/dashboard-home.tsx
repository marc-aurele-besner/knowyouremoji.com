'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRateLimit } from '@/hooks/use-rate-limit';
import Link from 'next/link';

const quickActions = [
  {
    label: 'Interpret a message',
    href: '/interpreter',
    icon: '🔍',
    description: 'Decode emoji meanings in any message',
  },
  {
    label: 'Browse emojis',
    href: '/emoji',
    icon: '📚',
    description: 'Explore our emoji encyclopedia',
  },
  {
    label: 'Search',
    href: '/search',
    icon: '🔎',
    description: 'Find emojis and combos',
  },
];

function DashboardHome() {
  const { used, remaining, maxUses } = useRateLimit();
  const usagePercent = maxUses > 0 ? Math.round((used / maxUses) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Welcome back! Here&apos;s your emoji interpretation overview.
        </p>
      </div>

      {/* Usage stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Interpretations Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{used}</div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">of {maxUses} daily limit</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                data-testid="usage-bar"
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Remaining Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{remaining}</div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {remaining > 0 ? 'interpretations available' : 'resets at midnight'}
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">Free</div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {maxUses} interpretations/day
            </p>
            <Link href="/pricing" className="mt-2 inline-block text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
              Upgrade for unlimited →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Card key={action.href} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="mb-3 text-3xl">{action.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{action.label}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
                <Button asChild variant="ghost" size="sm" className="mt-3 -ml-3">
                  <Link href={action.href}>Get started →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

DashboardHome.displayName = 'DashboardHome';

export { DashboardHome };
