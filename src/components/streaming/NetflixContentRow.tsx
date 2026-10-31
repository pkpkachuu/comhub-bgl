import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NetflixContentRowProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const NetflixContentRow: React.FC<NetflixContentRowProps> = ({
  id,
  title,
  subtitle,
  children,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id={id} className="relative px-4 md:px-12 my-6 group">
      {/* Row Header */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-xl md:text-2xl font-bold text-white tracking-wide">
            {title}
          </h3>
          {subtitle && (
            <span className="text-xs text-[#808080] font-normal hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Row Wrapper with Navigation Chevrons */}
      <div className="relative">
        {/* Left Chevron Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 md:-left-10 top-0 bottom-0 z-40 w-10 md:w-12 bg-black/60 hover:bg-black/90 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-r"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Scrollable Horizontal Track */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-4 -my-4 px-1"
        >
          {children}
        </div>

        {/* Right Chevron Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-4 md:-right-10 top-0 bottom-0 z-40 w-10 md:w-12 bg-black/60 hover:bg-black/90 text-white items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-l"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </section>
  );
};
