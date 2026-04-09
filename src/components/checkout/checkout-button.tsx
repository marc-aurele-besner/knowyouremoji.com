'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, type ButtonProps } from '@/components/ui/button';

type CheckoutButtonProps = Omit<ButtonProps, 'onClick' | 'loading' | 'disabled'>;

function CheckoutButton({ children, ...props }: CheckoutButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (status !== 'authenticated') {
      router.push('/login?callbackUrl=/pricing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to start checkout');
        return;
      }

      if (!data.url) {
        setError('No checkout URL returned');
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleCheckout} loading={isLoading} disabled={isLoading} {...props}>
        {children ?? 'Start Free Trial'}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

CheckoutButton.displayName = 'CheckoutButton';

export { CheckoutButton };
