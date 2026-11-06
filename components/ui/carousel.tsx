'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type CarouselContextProps = {
  containerRef: React.RefObject<HTMLDivElement>;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  currentIndex: number;
  totalSlides: number;
  registerSlide: (id: number) => void;
  unregisterSlide: (id: number) => void;
  orientation?: 'horizontal' | 'vertical';
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  opts?: {
    loop?: boolean;
    align?: 'start' | 'center' | 'end';
  };
}

export function Carousel({
  orientation = 'horizontal',
  opts,
  className,
  children,
  ...props
}: CarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [totalSlides, setTotalSlides] = React.useState(0);

  const slidesSet = React.useRef(new Set<number>());

  const registerSlide = React.useCallback((id: number) => {
    slidesSet.current.add(id);
    setTotalSlides(slidesSet.current.size);
  }, []);

  const unregisterSlide = React.useCallback((id: number) => {
    slidesSet.current.delete(id);
    setTotalSlides(slidesSet.current.size);
  }, []);

  const updateScrollState = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 10);

    const slideWidth = clientWidth;
    if (slideWidth > 0) {
      const activeIdx = Math.round(scrollLeft / (slideWidth * 0.75));
      setCurrentIndex(Math.min(Math.max(activeIdx, 0), Math.max(0, slidesSet.current.size - 1)));
    }
  }, []);

  const scrollPrev = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }, []);

  const scrollNext = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, []);

  const scrollTo = React.useCallback((index: number) => {
    const el = containerRef.current;
    if (!el) return;
    const slides = el.children;
    if (slides[index]) {
      (slides[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, []);

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
    const el = containerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  return (
    <CarouselContext.Provider
      value={{
        containerRef,
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        currentIndex,
        totalSlides,
        registerSlide,
        unregisterSlide,
        orientation,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative focus:outline-none select-none', className)}
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { containerRef, orientation } = useCarousel();

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar',
        orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
        className
      )}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      {...props}
    />
  );
}

export function CarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { registerSlide, unregisterSlide } = useCarousel();
  const idRef = React.useRef<number>();

  React.useEffect(() => {
    const id = Math.random();
    idRef.current = id;
    registerSlide(id);
    return () => {
      if (idRef.current !== undefined) {
        unregisterSlide(idRef.current);
      }
    };
  }, [registerSlide, unregisterSlide]);

  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-4 snap-start',
        className
      )}
      {...props}
    />
  );
}

export function CarouselPrevious({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <button
      type="button"
      className={cn(
        'absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#FAF5EE]/95 border border-[#D8D0C8] hover:border-[#C2652A] hover:bg-white text-[#3A302A] hover:text-[#C2652A] shadow-md flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      aria-label="Slide sebelumnya"
      {...props}
    >
      <ChevronLeft size={20} className="stroke-[2.2] -ml-0.5" />
    </button>
  );
}

export function CarouselNext({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <button
      type="button"
      className={cn(
        'absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#FAF5EE]/95 border border-[#D8D0C8] hover:border-[#C2652A] hover:bg-white text-[#3A302A] hover:text-[#C2652A] shadow-md flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      aria-label="Slide berikutnya"
      {...props}
    >
      <ChevronRight size={20} className="stroke-[2.2] -mr-0.5" />
    </button>
  );
}

export function CarouselDots({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { currentIndex, totalSlides, scrollTo } = useCarousel();

  if (totalSlides <= 1) return null;

  return (
    <div
      className={cn('flex items-center justify-center gap-2 pt-6', className)}
      {...props}
    >
      {Array.from({ length: totalSlides }).map((_, idx) => {
        const isActive = idx === currentIndex;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => scrollTo(idx)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              isActive
                ? 'w-7 bg-[#C2652A]'
                : 'w-2 bg-[#D8D0C8] hover:bg-[#A95420]/60'
            )}
            aria-label={`Ke slide ${idx + 1}`}
          />
        );
      })}
    </div>
  );
}

export function CarouselCounter({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { currentIndex, totalSlides } = useCarousel();

  if (totalSlides <= 1) return null;

  return (
    <span
      className={cn('text-xs font-mono text-[#9A9088] tracking-widest', className)}
      {...props}
    >
      {String(currentIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
    </span>
  );
}

