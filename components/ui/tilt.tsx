'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

export interface TiltProps extends HTMLMotionProps<'div'> {
  maxTilt?: number;
  perspective?: number;
  children?: React.ReactNode;
}

export function Tilt({
  maxTilt = 12,
  perspective = 800,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: TiltProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    onPointerMove?.(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    x.set(0);
    y.set(0);
    onPointerLeave?.(e);
  };

  return (
    <motion.div
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn('will-change-transform', className)}
      {...props}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full will-change-transform"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export interface TiltContentProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode;
}

export function TiltContent({ className, children, ...props }: TiltContentProps) {
  return (
    <motion.div
      style={{
        transformStyle: 'preserve-3d',
      }}
      className={cn('w-full h-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
