import { DashboardSidebar } from '@/components/dashboard';
import { Toaster } from '@/components/ui/toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10">
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[200px_minmax(0,1fr)] md:items-start md:gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <DashboardSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
