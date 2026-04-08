import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useServiceWorker } from '@/hooks/use-service-worker';

// ============================================
// MOCK SERVICE WORKER API
// ============================================

type StateChangeHandler = () => void;
type UpdateFoundHandler = () => void;

interface MockServiceWorker {
  state: string;
  postMessage: (msg: unknown) => void;
  addEventListener: (event: string, handler: StateChangeHandler) => void;
  _stateChangeHandler: StateChangeHandler | null;
}

interface MockRegistration {
  active: MockServiceWorker | null;
  installing: MockServiceWorker | null;
  waiting: MockServiceWorker | null;
  addEventListener: (event: string, handler: UpdateFoundHandler) => void;
  _updateFoundHandler: UpdateFoundHandler | null;
}

function createMockServiceWorker(state: string = 'activated'): MockServiceWorker {
  let stateChangeHandler: StateChangeHandler | null = null;
  return {
    state,
    postMessage: () => {},
    addEventListener: (_event: string, handler: StateChangeHandler) => {
      stateChangeHandler = handler;
    },
    get _stateChangeHandler() {
      return stateChangeHandler;
    },
  };
}

function createMockRegistration(
  options: {
    active?: MockServiceWorker | null;
    installing?: MockServiceWorker | null;
    waiting?: MockServiceWorker | null;
  } = {}
): MockRegistration {
  let updateFoundHandler: UpdateFoundHandler | null = null;
  return {
    active: options.active ?? null,
    installing: options.installing ?? null,
    waiting: options.waiting ?? null,
    addEventListener: (_event: string, handler: UpdateFoundHandler) => {
      updateFoundHandler = handler;
    },
    get _updateFoundHandler() {
      return updateFoundHandler;
    },
  };
}

function setupNavigator(options: { supported?: boolean; controller?: boolean } = {}) {
  const { supported = true, controller = false } = options;

  if (supported) {
    let registerFn: ((url: string, opts?: { scope: string }) => Promise<MockRegistration>) | null =
      null;

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: (url: string, opts?: { scope: string }) => {
          if (registerFn) return registerFn(url, opts);
          return Promise.resolve(createMockRegistration());
        },
        controller: controller ? {} : null,
      },
    });

    return {
      setRegister: (
        fn: (url: string, opts?: { scope: string }) => Promise<MockRegistration>
      ) => {
        registerFn = fn;
        (navigator.serviceWorker as unknown as { register: typeof fn }).register = fn;
      },
    };
  } else {
    // Remove serviceWorker from navigator to simulate unsupported browser
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: undefined,
    });
    return { setRegister: () => {} };
  }
}

describe('useServiceWorker', () => {
  let originalServiceWorker: ServiceWorkerContainer;

  beforeEach(() => {
    originalServiceWorker = navigator.serviceWorker;
  });

  afterEach(() => {
    cleanup();
    // Restore original navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: originalServiceWorker,
    });
  });

  describe('browser support detection', () => {
    it('should detect when service workers are supported', () => {
      setupNavigator({ supported: true });
      const { result } = renderHook(() => useServiceWorker());

      expect(result.current.isSupported).toBe(true);
    });

    it('should detect when service workers are not supported', () => {
      // Must delete serviceWorker before rendering the hook, since useState
      // initializer captures the value at first render
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: undefined,
      });
      // Also need to ensure 'serviceWorker' in navigator is false
      delete (navigator as unknown as Record<string, unknown>).serviceWorker;

      const { result } = renderHook(() => useServiceWorker());

      expect(result.current.isSupported).toBe(false);
      expect(result.current.isActive).toBe(false);
      expect(result.current.hasUpdate).toBe(false);
      expect(result.current.registration).toBeNull();
    });
  });

  describe('registration', () => {
    it('should register the service worker on mount', async () => {
      const mockReg = createMockRegistration();
      const mock = setupNavigator({ supported: true });
      mock.setRegister(() => Promise.resolve(mockReg));

      const { result } = renderHook(() => useServiceWorker());

      // Allow async register to complete
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.registration).toBe(mockReg);
    });

    it('should set isActive when registration already has an active worker', async () => {
      const activeWorker = createMockServiceWorker('activated');
      const mockReg = createMockRegistration({ active: activeWorker });
      const mock = setupNavigator({ supported: true });
      mock.setRegister(() => Promise.resolve(mockReg));

      const { result } = renderHook(() => useServiceWorker());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should handle registration failure gracefully', async () => {
      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});
      const mock = setupNavigator({ supported: true });
      mock.setRegister(() => Promise.reject(new Error('Registration failed')));

      const { result } = renderHook(() => useServiceWorker());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      // Should not throw, should remain in default state
      expect(result.current.isActive).toBe(false);
      expect(result.current.registration).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('update detection', () => {
    it('should detect waiting worker as an update when controller exists', async () => {
      const waitingWorker = createMockServiceWorker('installed');
      const mockReg = createMockRegistration({ waiting: waitingWorker });
      const mock = setupNavigator({ supported: true, controller: true });
      mock.setRegister(() => Promise.resolve(mockReg));

      const { result } = renderHook(() => useServiceWorker());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(result.current.hasUpdate).toBe(true);
    });

    it('should detect update when installing worker reaches installed state', async () => {
      const installingWorker = createMockServiceWorker('installing');
      const mockReg = createMockRegistration({ installing: installingWorker });
      const mock = setupNavigator({ supported: true, controller: true });
      mock.setRegister(() => Promise.resolve(mockReg));

      const { result } = renderHook(() => useServiceWorker());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      // Simulate updatefound event
      act(() => {
        mockReg._updateFoundHandler?.();
      });

      // Simulate worker state change to installed
      act(() => {
        installingWorker.state = 'installed';
        installingWorker._stateChangeHandler?.();
      });

      expect(result.current.hasUpdate).toBe(true);
    });

    it('should set isActive when new worker activates', async () => {
      const installingWorker = createMockServiceWorker('installing');
      const mockReg = createMockRegistration({ installing: installingWorker });
      const mock = setupNavigator({ supported: true });
      mock.setRegister(() => Promise.resolve(mockReg));

      const { result } = renderHook(() => useServiceWorker());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      // Simulate updatefound event
      act(() => {
        mockReg._updateFoundHandler?.();
      });

      // Simulate worker activation
      act(() => {
        installingWorker.state = 'activated';
        installingWorker._stateChangeHandler?.();
      });

      expect(result.current.isActive).toBe(true);
    });
  });

  describe('applyUpdate', () => {
    it('should post SKIP_WAITING message and reload when applying update', async () => {
      const waitingWorker = createMockServiceWorker('installed');
      const postMessageSpy = spyOn(waitingWorker, 'postMessage');
      const mockReg = createMockRegistration({ waiting: waitingWorker });
      const mock = setupNavigator({ supported: true, controller: true });
      mock.setRegister(() => Promise.resolve(mockReg));

      // Mock window.location.reload
      const reloadMock = spyOn(window.location, 'reload').mockImplementation(() => {});

      const { result } = renderHook(() => useServiceWorker());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      act(() => {
        result.current.applyUpdate();
      });

      expect(postMessageSpy).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
      expect(reloadMock).toHaveBeenCalled();

      reloadMock.mockRestore();
    });

    it('should be a no-op when no waiting worker exists', async () => {
      const mockReg = createMockRegistration();
      const mock = setupNavigator({ supported: true });
      mock.setRegister(() => Promise.resolve(mockReg));

      const reloadMock = spyOn(window.location, 'reload').mockImplementation(() => {});

      const { result } = renderHook(() => useServiceWorker());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      act(() => {
        result.current.applyUpdate();
      });

      expect(reloadMock).not.toHaveBeenCalled();

      reloadMock.mockRestore();
    });
  });

  describe('initial state', () => {
    it('should return correct default state', () => {
      setupNavigator({ supported: true });
      const { result } = renderHook(() => useServiceWorker());

      expect(result.current.isSupported).toBe(true);
      expect(result.current.isActive).toBe(false);
      expect(result.current.hasUpdate).toBe(false);
      expect(result.current.registration).toBeNull();
      expect(typeof result.current.applyUpdate).toBe('function');
    });
  });
});
