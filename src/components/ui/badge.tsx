import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        {
          'bg-primary-50 text-primary-700': variant === 'default',
          'bg-muted text-muted-foreground': variant === 'secondary',
          'bg-success-background text-success': variant === 'success',
          'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-500/30':
            variant === 'warning',
          'bg-danger-background text-danger': variant === 'destructive',
          'border border-card-border bg-transparent text-muted-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
