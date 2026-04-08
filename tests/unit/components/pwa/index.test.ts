import { describe, it, expect } from 'bun:test';
import * as pwaExports from '@/components/pwa/index';

describe('pwa/index exports', () => {
  it('exports ServiceWorkerRegister', () => {
    expect(pwaExports.ServiceWorkerRegister).toBeDefined();
    expect(typeof pwaExports.ServiceWorkerRegister).toBe('function');
  });
});
