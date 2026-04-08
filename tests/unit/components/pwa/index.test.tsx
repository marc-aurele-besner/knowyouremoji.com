import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

// Mock the useServiceWorker hook
const mockApplyUpdate = mock(() => {});
let mockHookReturn = {
  isSupported: true,
  isActive: false,
  hasUpdate: false,
  registration: null as ServiceWorkerRegistration | null,
  applyUpdate: mockApplyUpdate,
};

// We need to mock the module before importing the component
mock.module('@/hooks/use-service-worker', () => ({
  useServiceWorker: () => mockHookReturn,
}));

// Import after mock setup
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration';

describe('ServiceWorkerRegistration', () => {
  beforeEach(() => {
    mockApplyUpdate.mockReset();
    mockHookReturn = {
      isSupported: true,
      isActive: false,
      hasUpdate: false,
      registration: null,
      applyUpdate: mockApplyUpdate,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('should render nothing when no update is available', () => {
    const { container } = render(<ServiceWorkerRegistration />);
    expect(container.innerHTML).toBe('');
  });

  it('should render update prompt when update is available', () => {
    mockHookReturn.hasUpdate = true;
    render(<ServiceWorkerRegistration />);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('A new version is available.')).toBeDefined();
    expect(screen.getByText('Update now')).toBeDefined();
  });

  it('should call applyUpdate when update button is clicked', () => {
    mockHookReturn.hasUpdate = true;
    render(<ServiceWorkerRegistration />);

    fireEvent.click(screen.getByText('Update now'));

    expect(mockApplyUpdate).toHaveBeenCalledTimes(1);
  });

  it('should render nothing when service worker is not supported', () => {
    mockHookReturn.isSupported = false;
    mockHookReturn.hasUpdate = false;
    const { container } = render(<ServiceWorkerRegistration />);
    expect(container.innerHTML).toBe('');
  });
});
