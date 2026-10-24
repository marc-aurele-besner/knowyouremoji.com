import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for the emoji detail page
 * Mirrors the hero / TL;DR / section layout while the page data is loading
 */
export default function Loading() {
  return (
    <main
      className="container mx-auto max-w-6xl px-4 pb-20 pt-8 md:pt-10"
      role="status"
      aria-label="Loading emoji details"
    >
      {/* Breadcrumb skeleton */}
      <Skeleton className="mb-6 h-3.5 w-60" data-testid="skeleton" />

      {/* Hero skeleton */}
      <header className="flex flex-wrap items-center gap-6 md:gap-7">
        <Skeleton
          className="h-28 w-28 rounded-[28px] md:h-[132px] md:w-[132px]"
          data-testid="emoji-skeleton"
        />
        <div className="flex min-w-0 flex-1 basis-72 flex-col gap-3">
          <Skeleton className="h-12 w-1/2" data-testid="title-skeleton" />
          <Skeleton className="h-5 w-1/3" data-testid="skeleton" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-full" data-testid="skeleton" />
            <Skeleton className="h-10 w-20 rounded-full" data-testid="skeleton" />
          </div>
        </div>
      </header>

      {/* TL;DR skeleton */}
      <Skeleton className="mt-7 h-24 w-full rounded-2xl" data-testid="tldr-skeleton" />

      {/* Section cards skeleton */}
      <section className="mt-14" data-testid="content-skeleton">
        <Skeleton className="mb-5 h-7 w-64" data-testid="skeleton" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" data-testid="skeleton" />
          ))}
        </div>
      </section>
    </main>
  );
}
