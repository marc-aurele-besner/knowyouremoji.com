import { describe, it, expect } from 'bun:test';
import * as layoutComponents from '@/components/layout';

describe('Layout Components barrel export (index.ts)', () => {
  describe('Header exports', () => {
    it('exports Header component', () => {
      expect(layoutComponents.Header).toBeDefined();
    });
  });

  describe('Footer exports', () => {
    it('exports Footer component', () => {
      expect(layoutComponents.Footer).toBeDefined();
    });
  });

  describe('MobileNav exports', () => {
    it('exports MobileNav component', () => {
      expect(layoutComponents.MobileNav).toBeDefined();
    });
  });

  describe('Breadcrumbs exports', () => {
    it('exports Breadcrumbs component', () => {
      expect(layoutComponents.Breadcrumbs).toBeDefined();
    });
  });

  describe('all exports are valid', () => {
    it('exports the correct number of items (4 components)', () => {
      const exportedKeys = Object.keys(layoutComponents);
      // Header, Footer, MobileNav, Breadcrumbs = 4 components
      expect(exportedKeys.length).toBe(4);
    });

    it('all component exports are valid React components', () => {
      const componentNames = ['Header', 'Footer', 'MobileNav', 'Breadcrumbs'];
      componentNames.forEach((name) => {
        const component = layoutComponents[name as keyof typeof layoutComponents];
        // React components can be functions or objects (forwardRef returns an object)
        const isFunction = typeof component === 'function';
        const isForwardRef =
          typeof component === 'object' &&
          component !== null &&
          '$$typeof' in component &&
          'render' in component;
        expect(isFunction || isForwardRef).toBe(true);
      });
    });
  });
});
