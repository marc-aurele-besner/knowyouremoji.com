import { Skeleton } from '@/components/ui/skeleton';

export default function InterpreterLoading() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Skeleton className="mb-6 h-4 w-40" />

      <section className="mb-6">
        <Skeleton className="mb-4 h-12 w-72" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </section>

      <section className="space-y-4 rounded-2xl border border-card-border bg-card p-5 md:p-7">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
      </section>
    </main>
  );
}
