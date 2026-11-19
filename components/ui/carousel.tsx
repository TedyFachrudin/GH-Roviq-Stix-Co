'use client';

import * as React from 'react';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type CarouselApi = UseEmblaCarouselType[1];

export type CarouselOptions = EmblaOptionsType & {
  scale?: number;
  visible?: number;
};

export type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: EmblaPluginType[];
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
  className?: string;
  children?: React.ReactNode;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}

export function Carousel({
  orientation = 'horizontal',
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const onSelect = React.useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const onInit = React.useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onInit(api);
    api.on('reInit', onInit);
    api.on('select', onSelect);

    return () => {
      api?.off('select', onSelect);
      api?.off('reInit', onInit);
    };
  }, [api, onInit, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation:
          orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className
        )}
        {...props}
      />
    </div>
  );
}

export function CarouselItem({
  className,
  index,
  ...props
}: React.ComponentProps<'div'> & { index?: number }) {
  const { orientation, selectedIndex, opts } = useCarousel();
  const isScaleEnabled = opts?.scale !== undefined;
  const isSelected = index !== undefined ? index === selectedIndex : false;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      data-active={isSelected}
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full transition-all duration-500 ease-out',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        isScaleEnabled && (
          isSelected
            ? 'scale-100 opacity-100 z-10'
            : 'scale-[0.88] opacity-75'
        ),
        className
      )}
      {...props}
    />
  );
}

export function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        'absolute touch-manipulation rounded-full z-20 shadow-md border-[#D8D0C8] bg-[#FAF5EE]/95 hover:bg-white text-[#7E4124]',
        orientation === 'horizontal'
          ? 'top-1/2 -left-3 sm:-left-5 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2.5} className="w-4 h-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

export function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon-sm',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        'absolute touch-manipulation rounded-full z-20 shadow-md border-[#D8D0C8] bg-[#FAF5EE]/95 hover:bg-white text-[#7E4124]',
        orientation === 'horizontal'
          ? 'top-1/2 -right-3 sm:-right-5 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.5} className="w-4 h-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

/**
 * Animated Stretching Dots:
 * The current dot is an elongated pill stretching smoothly from one to the next
 */
export function CarouselDots({ className }: { className?: string }) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();

  if (scrollSnaps.length <= 1) return null;

  return (
    <div className={cn('flex items-center gap-1.5 justify-center py-2', className)}>
      {scrollSnaps.map((_, index) => {
        const isSelected = index === selectedIndex;
        return (
          <button
            key={index}
            type="button"
            onClick={() => scrollTo(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300 ease-out focus:outline-none',
              isSelected
                ? 'w-7 bg-[#7E4124] shadow-xs'
                : 'w-2 bg-[#D8D0C8] hover:bg-[#AC6D36]'
            )}
            aria-label={`Slide ke ${index + 1}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Sliding Counter:
 * Displays slide count e.g. "01 / 06" with sliding transition
 */
export function CarouselCounter({ className }: { className?: string }) {
  const { scrollSnaps, selectedIndex } = useCarousel();
  const total = scrollSnaps.length;

  if (total <= 1) return null;

  const currentFormatted = String(selectedIndex + 1).padStart(2, '0');
  const totalFormatted = String(total).padStart(2, '0');

  return (
    <div className={cn('text-xs font-mono tracking-widest text-[#7A7269] font-medium select-none', className)}>
      <span className="text-[#010101] font-bold">{currentFormatted}</span>
      <span className="mx-1.5 opacity-40">/</span>
      <span>{totalFormatted}</span>
    </div>
  );
}

export default useEmblaCarousel;
