import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for category page
 */
export default function CategoryLoading() {
  return (
    <main className="container mx-auto max-w-6xl px-4 pb-20 pt-8 md:pt-10">
      {/* Header skeleton */}
      <header className="mb-7">
        <Skeleton className="mb-5 h-3.5 w-48" />
        <Skeleton className="mb-3 h-11 w-72" />
        <Skeleton className="mb-2 h-5 w-full max-w-xl" />
        <Skeleton className="h-4 w-32" />
      </header>

      {/* Chip skeleton */}
      <div className="mb-7 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(168px,1fr))]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-[150px] flex-col gap-2 rounded-2xl border border-card-border bg-card p-4"
          >
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
