import { KpiTile } from '@/components/dashboard/dashboard-ui';
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Book Banner</h2>
        {daily.length > 0 && <Badge variant="secondary">Last {daily.length} days</Badge>}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiTile
          label="Banner Views"
          value={formatNumber(totals.views)}
          valueTestId="banner-total-views"
        >
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(windowTotals.views)} in this window
          </p>
        </KpiTile>
        <KpiTile
          label="Banner Clicks"
          value={formatNumber(totals.clicks)}
          valueTestId="banner-total-clicks"
        >
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(windowTotals.clicks)} in this window
          </p>
        </KpiTile>
        <KpiTile
          label="Click-Through Rate"
          value={formatClickRate(totals)}
          valueTestId="banner-ctr"
        >
          <p className="mt-1 text-xs text-muted-foreground">
            {formatClickRate(windowTotals)} in this window
          </p>
        </KpiTile>
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">
            Views and clicks per day (UTC)
          </h3>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-primary-500" aria-hidden="true" />
              Views
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-foreground" aria-hidden="true" />
              Clicks
            </span>
          </div>
        </div>
        {maxDaily === 0 ? (
          <p className="text-sm text-muted-foreground">
            No banner activity recorded in this window yet.
          </p>
        ) : (
          <>
            <ol
              className="flex h-40 items-end gap-1 border-b border-card-border"
              aria-label="Daily banner activity"
            >
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
                    className="w-1/2 rounded-t-sm bg-primary-500"
                    style={{ height: `${(entry.views / maxDaily) * 100}%` }}
                  />
                  <span
                    aria-hidden="true"
                    className="w-1/2 rounded-t-sm bg-foreground"
                    style={{ height: `${(entry.clicks / maxDaily) * 100}%` }}
                  />
                </li>
              ))}
            </ol>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{formatDay(daily[0].day)}</span>
              <span>{formatDay(daily[daily.length - 1].day)}</span>
            </div>
          </>
        )}
      </div>

      {byBanner.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">By banner (all time)</h3>
          <div className="overflow-x-auto rounded-2xl border border-card-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-card-border bg-muted/60">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-left"
                  >
                    Banner
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right"
                  >
                    Views
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right"
                  >
                    Clicks
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right"
                  >
                    CTR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {byBanner.map((row) => (
                  <tr key={row.banner} className="text-foreground">
                    <td className="px-4 py-3 font-mono text-xs">{row.banner}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.views)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatNumber(row.clicks)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatClickRate(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
