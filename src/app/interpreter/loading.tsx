import { Skeleton } from '@/components/ui/skeleton';

export default function InterpreterLoading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-4 w-48 mb-6" />

      <section className="text-center mb-12">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <Skeleton className="h-32 w-full" />
      </section>
    </main>
  );
}
