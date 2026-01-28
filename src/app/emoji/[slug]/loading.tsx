import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

/**
 * Loading skeleton for the emoji detail page
 * Displays placeholder content while the page data is loading
 */
export default function Loading() {
  return (
    <main
      className="container mx-auto px-4 py-8 max-w-4xl"
      role="status"
      aria-label="Loading emoji details"
    >
      {/* Header Skeleton */}
      <header className="flex flex-col items-center text-center py-8 px-4">
        {/* Emoji Character Skeleton */}
        <Skeleton
          className="w-24 h-24 md:w-32 md:h-32 rounded-full mb-4"
          data-testid="emoji-skeleton"
        />

        {/* Title Skeleton */}
        <Skeleton className="h-8 w-48 mb-4" data-testid="title-skeleton" />

        {/* Copy Button Skeleton */}
        <Skeleton className="h-10 w-32 mb-6" data-testid="skeleton" />

        {/* Unicode Info Skeleton */}
        <Skeleton className="h-20 w-64" data-testid="skeleton" />
      </header>

      {/* TL;DR Section Skeleton */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" data-testid="tldr-skeleton" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" data-testid="skeleton" />
            <Skeleton className="h-4 w-3/4" data-testid="skeleton" />
          </CardContent>
        </Card>
      </section>

      {/* Context Meanings Section Skeleton */}
      <section className="mb-8" data-testid="content-skeleton">
        <Skeleton className="h-7 w-40 mb-4" data-testid="skeleton" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20" data-testid="skeleton" />
                  <Skeleton className="h-6 w-24" data-testid="skeleton" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" data-testid="skeleton" />
                <Skeleton className="h-4 w-2/3" data-testid="skeleton" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform Notes Section Skeleton */}
      <section className="mb-8">
        <Skeleton className="h-7 w-36 mb-4" data-testid="skeleton" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24" data-testid="skeleton" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" data-testid="skeleton" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Generational Notes Section Skeleton */}
      <section className="mb-8">
        <Skeleton className="h-7 w-52 mb-4" data-testid="skeleton" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-20" data-testid="skeleton" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" data-testid="skeleton" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
