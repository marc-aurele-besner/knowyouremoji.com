import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Loading skeleton for category page
 */
export default function CategoryLoading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header skeleton */}
      <header className="mb-8">
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-6 w-full max-w-xl mb-2" />
        <Skeleton className="h-4 w-32" />
      </header>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <Skeleton className="h-10 w-10 mx-auto mb-2 rounded" />
              <Skeleton className="h-4 w-20 mx-auto mb-1" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
