import { describe, it, expect } from 'bun:test';
import * as dashboardComponents from '@/components/dashboard';

describe('Dashboard Components barrel export (index.ts)', () => {
  it('exports DashboardSidebar component', () => {
    expect(dashboardComponents.DashboardSidebar).toBeDefined();
  });

  it('exports DashboardHome component', () => {
    expect(dashboardComponents.DashboardHome).toBeDefined();
  });

  it('exports the correct number of items (2 components)', () => {
    const exportedKeys = Object.keys(dashboardComponents);
    expect(exportedKeys.length).toBe(2);
  });

  it('all component exports are functions', () => {
    const componentNames = ['DashboardSidebar', 'DashboardHome'];
    componentNames.forEach((name) => {
      const component = dashboardComponents[name as keyof typeof dashboardComponents];
      expect(typeof component).toBe('function');
    });
  });
});
