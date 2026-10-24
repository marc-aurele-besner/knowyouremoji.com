/**
 * Admin pages render inside the (dashboard) group layout, which already provides the
 * sidebar and page container, so this layout only passes its children through.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
