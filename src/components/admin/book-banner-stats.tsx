import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface BookBannerCountsData {
  views: number;
  clicks: number;
}

export interface BookBannerStatsData {
  totals: BookBannerCountsData;
  daily: (BookBannerCountsData & { day: string })[];
  byBanner: (BookBannerCountsData & { banner: string })[];
}

export interface BookBannerStatsProps {
  stats: BookBannerStatsData;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatClickRate({ views, clicks }: BookBannerCountsData): string {
  if (views === 0) return '—';
  return `${((clicks / views) * 100).toFixed(1)}%`;
}

function formatDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function BookBannerStats({ stats }: BookBannerStatsProps) {
  const { totals, daily, byBanner } = stats;
  const windowTotals = daily.reduce(
    (acc, entry) => ({ views: acc.views + entry.views, clicks: acc.clicks + entry.clicks }),
    { views: 0, clicks: 0 }
  );
  const maxDaily = daily.reduce((acc, entry) => Math.max(acc, entry.views, entry.clicks), 0);

  return (
    <section aria-label="Book banner" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Book Banner</h2>
        {daily.length > 0 && <Badge variant="secondary">Last {daily.length} days</Badge>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Banner Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              data-testid="banner-total-views"
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              {formatNumber(totals.views)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(windowTotals.views)} in this window
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Banner Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              data-testid="banner-total-clicks"
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              {formatNumber(totals.clicks)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(windowTotals.clicks)} in this window
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Click-Through Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              data-testid="banner-ctr"
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              {formatClickRate(totals)}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formatClickRate(windowTotals)} in this window
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Views and clicks per day (UTC)</CardTitle>
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-amber-500" aria-hidden="true" />
              Views
            </span>
            <span className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-sm bg-blue-600 dark:bg-blue-400"
                aria-hidden="true"
              />
              Clicks
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {maxDaily === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No banner activity recorded in this window yet.
            </p>
          ) : (
            <>
              <ol className="flex h-40 items-end gap-1" aria-label="Daily banner activity">
                {daily.map((entry) => (
                  <li
                    key={entry.day}
                    title={`${formatDay(entry.day)}: ${formatNumber(entry.views)} views, ${formatNumber(entry.clicks)} clicks`}
                    className="flex h-full flex-1 items-end gap-px"
                  >
                    <span className="sr-only">
                      {formatDay(entry.day)}: {entry.views} views, {entry.clicks} clicks
                    </span>
                    <span
                      aria-hidden="true"
                      className="w-1/2 rounded-t-sm bg-amber-500"
                      style={{ height: `${(entry.views / maxDaily) * 100}%` }}
                    />
                    <span
                      aria-hidden="true"
                      className="w-1/2 rounded-t-sm bg-blue-600 dark:bg-blue-400"
                      style={{ height: `${(entry.clicks / maxDaily) * 100}%` }}
                    />
                  </li>
                ))}
              </ol>
              <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatDay(daily[0].day)}</span>
                <span>{formatDay(daily[daily.length - 1].day)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {byBanner.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By banner (all time)</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="py-2 font-medium">Banner</th>
                  <th className="py-2 text-right font-medium">Views</th>
                  <th className="py-2 text-right font-medium">Clicks</th>
                  <th className="py-2 text-right font-medium">CTR</th>
                </tr>
              </thead>
              <tbody>
                {byBanner.map((row) => (
                  <tr
                    key={row.banner}
                    className="border-t border-gray-100 text-gray-900 dark:border-gray-800 dark:text-white"
                  >
                    <td className="py-2 font-mono text-xs">{row.banner}</td>
                    <td className="py-2 text-right tabular-nums">{formatNumber(row.views)}</td>
                    <td className="py-2 text-right tabular-nums">{formatNumber(row.clicks)}</td>
                    <td className="py-2 text-right tabular-nums">{formatClickRate(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
