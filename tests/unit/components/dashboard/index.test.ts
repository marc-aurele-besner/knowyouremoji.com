import { describe, it, expect, mock } from 'bun:test';

// Mock dependencies that dashboard components need
mock.module('next-auth/react', () => ({
  signIn: mock(() => Promise.resolve({ error: null })),
  signOut: mock(() => Promise.resolve()),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

mock.module('@/hooks/use-rate-limit', () => ({
  useRateLimit: () => ({
    used: 0,
    remaining: 3,
    maxUses: 3,
    canUse: true,
    isLimited: false,
    resetTime: new Date(),
    recordUse: mock(() => 0),
    reset: mock(() => {}),
  }),
}));

mock.module('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: mock(() => {}) }),
}));

const dashboardComponents = await import('@/components/dashboard');

describe('Dashboard Components barrel export (index.ts)', () => {
  it('exports DashboardSidebar component', () => {
    expect(dashboardComponents.DashboardSidebar).toBeDefined();
  });

  it('exports DashboardHome component', () => {
    expect(dashboardComponents.DashboardHome).toBeDefined();
  });

  it('exports HistoryPage component', () => {
    expect(dashboardComponents.HistoryPage).toBeDefined();
  });

  it('exports SettingsPage component', () => {
    expect(dashboardComponents.SettingsPage).toBeDefined();
  });

  it('exports the correct number of items (4 components)', () => {
    const exportedKeys = Object.keys(dashboardComponents);
    expect(exportedKeys.length).toBe(4);
  });

  it('all component exports are functions', () => {
    const componentNames = ['DashboardSidebar', 'DashboardHome', 'HistoryPage', 'SettingsPage'];
    componentNames.forEach((name) => {
      const component = dashboardComponents[name as keyof typeof dashboardComponents];
      expect(typeof component).toBe('function');
    });
  });
});
