import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1.5', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  size?: 'default' | 'icon';
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PaginationLink = ({
  className,
  isActive,
  size = 'default',
  disabled,
  ...props
}: PaginationLinkProps) => (
  <button
    type="button"
    aria-current={isActive ? 'page' : undefined}
    disabled={disabled}
    className={cn(
      'inline-flex items-center justify-center rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
      size === 'default' && 'h-9 min-w-9 px-3',
      size === 'icon' && 'h-9 w-9 p-0',
      isActive
        ? 'bg-[#C2652A] text-white shadow-sm border border-[#C2652A]'
        : 'bg-white text-[#3A302A] border border-[#D8D0C8] hover:bg-[#F6F0E8] hover:border-[#C2652A]',
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

export const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Sebelumnya</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

export const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>Berikutnya</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

export const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center text-[#9A9088]', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

