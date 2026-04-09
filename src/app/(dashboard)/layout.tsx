import { DashboardSidebar } from '@/components/dashboard';
import { Toaster } from '@/components/ui/toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 md:px-8">{children}</div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
