import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
