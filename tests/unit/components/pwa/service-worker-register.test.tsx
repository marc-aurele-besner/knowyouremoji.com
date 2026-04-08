import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render } from '@testing-library/react';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';

describe('ServiceWorkerRegister', () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('renders nothing', () => {
    const { container } = render(<ServiceWorkerRegister />);
    expect(container.innerHTML).toBe('');
  });

  it('registers the service worker when supported', async () => {
    const mockRegister = mock(() => Promise.resolve({} as ServiceWorkerRegistration));

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        ...originalNavigator,
        serviceWorker: { register: mockRegister },
      },
      writable: true,
      configurable: true,
    });

    render(<ServiceWorkerRegister />);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(mockRegister).toHaveBeenCalledWith('/sw.js');
  });

  it('does not throw when registration fails', async () => {
    const mockRegister = mock(() => Promise.reject(new Error('registration failed')));

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        ...originalNavigator,
        serviceWorker: { register: mockRegister },
      },
      writable: true,
      configurable: true,
    });

    render(<ServiceWorkerRegister />);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockRegister).toHaveBeenCalledTimes(1);
    // No error thrown — test passes
  });

  it('does not register when serviceWorker is not supported', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    });

    render(<ServiceWorkerRegister />);
    await new Promise((r) => setTimeout(r, 10));

    // No error thrown — test passes
  });
});
