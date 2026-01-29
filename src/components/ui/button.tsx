'use client';

import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400':
              variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600':
              variant === 'secondary',
            'hover:bg-gray-100 focus-visible:ring-gray-400 dark:hover:bg-gray-800 dark:text-gray-100':
              variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 dark:bg-red-700 dark:hover:bg-red-600':
              variant === 'destructive',
            'border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-400 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800':
              variant === 'outline',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? (
              <span className="mr-2 animate-spin" aria-label="Loading">
                ⏳
              </span>
            ) : null}
            {children}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button };
