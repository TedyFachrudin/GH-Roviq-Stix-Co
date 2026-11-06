import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon-sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          variant === 'default' && 'bg-[#C2652A] text-white hover:bg-[#A95420]',
          variant === 'outline' &&
            'border border-[#D8D0C8] bg-[#FAF5EE] text-[#3A302A] hover:bg-[#F2ECE4] hover:border-[#C2652A]',
          variant === 'ghost' && 'text-[#3A302A] hover:bg-[#F6F0E8]',
          size === 'default' && 'h-10 px-4 py-2 text-sm',
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'icon-sm' && 'h-8 w-8',
          size === 'lg' && 'h-12 px-6 text-base',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

