'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';

export type SlideDirection = 'up' | 'down' | 'left' | 'right';
export type Slide = {
  direction?: SlideDirection;
  offset?: number;
};
export type Fade = {
  initialOpacity?: number;
  opacity?: number;
};
export type Zoom = {
  initialScale?: number;
  scale?: number;
};
export type Blur = {
  initialBlur?: number;
  blur?: number;
};

export interface EffectProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode;
  delay?: number;
  blur?: Blur | boolean;
  slide?: Slide | boolean;
  fade?: Fade | boolean;
  zoom?: Zoom | boolean;
  inView?: boolean;
}

export function Effect({
  children,
  delay = 0,
  blur = true,
  slide = true,
  fade = true,
  zoom = true,
  inView = false,
  className,
  ...props
}: EffectProps) {
  const initialBlur = typeof blur === 'object' ? blur.initialBlur ?? 12 : blur ? 12 : 0;
  const targetBlur = typeof blur === 'object' ? blur.blur ?? 0 : 0;

  const initialOpacity = typeof fade === 'object' ? fade.initialOpacity ?? 0 : fade ? 0 : 1;
  const targetOpacity = typeof fade === 'object' ? fade.opacity ?? 1 : 1;

  const initialScale = typeof zoom === 'object' ? zoom.initialScale ?? 0.95 : zoom ? 0.95 : 1;
  const targetScale = typeof zoom === 'object' ? zoom.scale ?? 1 : 1;

  let slideOffset = 24;
  let slideX = 0;
  let slideY = 0;

  if (slide) {
    const direction = typeof slide === 'object' ? slide.direction ?? 'up' : 'up';
    const offset = typeof slide === 'object' ? slide.offset ?? 24 : 24;
    slideOffset = offset;
    if (direction === 'up') slideY = slideOffset;
    if (direction === 'down') slideY = -slideOffset;
    if (direction === 'left') slideX = slideOffset;
    if (direction === 'right') slideX = -slideOffset;
  }

  const initial = {
    opacity: initialOpacity,
    scale: initialScale,
    x: slideX,
    y: slideY,
    filter: blur ? `blur(${initialBlur}px)` : 'none',
  };

  const animate = {
    opacity: targetOpacity,
    scale: targetScale,
    x: 0,
    y: 0,
    filter: blur ? `blur(${targetBlur}px)` : 'none',
  };

  const transition: Transition = {
    type: 'spring',
    stiffness: 260,
    damping: 24,
    delay,
  };

  return (
    <motion.div
      initial={initial}
      {...(inView
        ? { whileInView: animate, viewport: { once: true, margin: '-40px' } }
        : { animate })}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export interface EffectsProps extends Omit<EffectProps, 'children'> {
  children: React.ReactElement | React.ReactElement[];
  holdDelay?: number;
}

export function Effects({
  children,
  delay = 0,
  holdDelay = 80,
  ...props
}: EffectsProps) {
  const childArray = React.Children.toArray(children);

  return (
    <>
      {childArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;
        const itemDelay = delay + (index * holdDelay) / 1000;
        return (
          <Effect key={child.key ?? index} delay={itemDelay} {...props}>
            {child}
          </Effect>
        );
      })}
    </>
  );
}

export function PageEntrance({
  children,
  delay = 0,
  blur = true,
  slide = true,
  fade = true,
  zoom = true,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  blur?: boolean;
  slide?: boolean;
  fade?: boolean;
  zoom?: boolean;
  className?: string;
}) {
  return (
    <Effect
      delay={delay}
      blur={blur}
      slide={slide ? { direction: 'up', offset: 20 } : false}
      fade={fade}
      zoom={zoom ? { initialScale: 0.98, scale: 1 } : false}
      className={className}
    >
      {children}
    </Effect>
  );
}
