import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-blue-100 text-blue-800 hover:bg-blue-200': variant === 'default',
          'bg-gray-100 text-gray-800 hover:bg-gray-200': variant === 'secondary',
          'bg-green-100 text-green-800 hover:bg-green-200': variant === 'success',
          'bg-yellow-100 text-yellow-800 hover:bg-yellow-200': variant === 'warning',
          'bg-red-100 text-red-800 hover:bg-red-200': variant === 'destructive',
          'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100':
            variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
