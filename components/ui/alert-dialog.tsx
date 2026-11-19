'use client';

import * as React from 'react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AlertDialogContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextProps | null>(null);

function useAlertDialog() {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog components must be used within an <AlertDialog />');
  }
  return context;
}

interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function AlertDialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({
  render,
  children,
  onClick,
  ...props
}: {
  render?: React.ReactElement;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
} & React.HTMLAttributes<HTMLElement>) {
  const { setOpen } = useAlertDialog();

  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    setOpen(true);
  };

  if (render) {
    return React.cloneElement(render, {
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
}

function AlertDialogOverlay({
  className,
  ...props
}: HTMLMotionProps<'div'>) {
  const { setOpen } = useAlertDialog();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => setOpen(false)}
      className={cn(
        'bg-black/50 backdrop-blur-sm fixed inset-0 isolate z-50',
        className
      )}
      {...props}
    />
  );
}

interface AlertDialogContentProps extends HTMLMotionProps<'div'> {
  from?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'default' | 'sm';
}

function AlertDialogContent({
  className,
  from = 'top',
  size = 'default',
  children,
  ...props
}: AlertDialogContentProps) {
  const { open, setOpen } = useAlertDialog();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  const offsetDirections = {
    top: { y: -30, x: '-50%' },
    bottom: { y: 30, x: '-50%' },
    left: { x: '-60%', y: '-50%' },
    right: { x: '-40%', y: '-50%' },
  };

  const initialOffset = offsetDirections[from] || offsetDirections.top;

  return (
    <AlertDialogPortal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AlertDialogOverlay />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              initial={{
                opacity: 0,
                scale: 0.95,
                x: initialOffset.x,
                y: initialOffset.y,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: '-50%',
                y: '-50%',
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                x: initialOffset.x,
                y: initialOffset.y,
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              data-slot="alert-dialog-content"
              data-size={size}
              className={cn(
                'bg-[#FAF5EE] text-[#010101] border border-[#D8D0C8] gap-4 rounded-2xl p-6 shadow-2xl',
                size === 'sm' ? 'max-w-xs' : 'max-w-md',
                'fixed top-1/2 left-1/2 z-50 grid w-full outline-none select-none',
                className
              )}
              {...(props as any)}
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'bg-[#F3EFEA] -mx-6 -mb-6 rounded-b-2xl border-t border-[#D8D0C8] p-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4',
        className
      )}
      {...props}
    />
  );
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "bg-[#EAE4DA] mb-2 inline-flex size-10 items-center justify-center rounded-xl *:[svg:not([class*='size-'])]:size-6 mx-auto sm:mx-0",
        className
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="alert-dialog-title"
      className={cn('text-base font-bold text-[#010101]', className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="alert-dialog-description"
      className={cn('text-[#7A7269] text-sm text-balance md:text-pretty leading-relaxed', className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { setOpen } = useAlertDialog();
  return (
    <Button
      data-slot="alert-dialog-action"
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      className={cn('', className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  variant = 'outline',
  size = 'default',
  onClick,
  render,
  ...props
}: {
  variant?: 'outline' | 'default' | 'ghost';
  size?: 'default' | 'sm' | 'icon-sm' | 'lg';
  render?: React.ReactElement;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useAlertDialog();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setOpen(false);
  };

  if (render) {
    return React.cloneElement(render, {
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <Button
      data-slot="alert-dialog-cancel"
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn('', className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
