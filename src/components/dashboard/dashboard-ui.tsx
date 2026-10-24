import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Page heading used across the dashboard and admin pages. */
export function DashboardPageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** Dashed empty-state box: emoji, bold line, muted line, optional action. */
export function EmptyState({
  emoji,
  title,
  description,
  action,
  className,
}: {
  emoji: string;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center text-muted-foreground',
        className
      )}
    >
      <div className="emoji-display text-4xl" aria-hidden="true">
        {emoji}
      </div>
      <h2 className="text-[17px] font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-sm">{description}</p>
      {action ? <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/** KPI tile: muted label, large value, optional footnote / extra content. */
export function KpiTile({
  label,
  value,
  children,
  valueTestId,
  className,
}: {
  label: string;
  value: ReactNode;
  children?: ReactNode;
  valueTestId?: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-card-border bg-card p-[18px]', className)}>
      <div className="text-[13px] text-muted-foreground">{label}</div>
      <div
        data-testid={valueTestId}
        className="mt-1 text-[30px] font-semibold leading-tight tracking-tight text-foreground tabular-nums"
      >
        {value}
      </div>
      {children}
    </div>
  );
}

/** Settings-style card section with a heading. */
export function SectionCard({
  title,
  children,
  tone = 'default',
  className,
}: {
  title: string;
  children: ReactNode;
  tone?: 'default' | 'danger';
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border bg-card p-6 md:p-7',
        tone === 'danger' ? 'border-danger/40' : 'border-card-border',
        className
      )}
    >
      <h2
        className={cn(
          'mb-4 text-lg font-semibold tracking-tight',
          tone === 'danger' ? 'text-danger' : 'text-foreground'
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Form-level error / success banners. */
export const formErrorClass = 'rounded-xl bg-danger-background px-3.5 py-3 text-sm text-danger';
export const formOkClass = 'rounded-xl bg-success-background px-3.5 py-3 text-sm text-success';

/** Skeleton rows for loading states. */
export function SkeletonRows({ count, testId }: { count: number; testId?: string }) {
  return (
    <div
      className="divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-card"
      data-testid={testId}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2.5 px-4 py-4">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
