import React, { useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

// --- Types (Exported Separately) ---
/**
 * Defines the structure for a single slide's data.
 * The 'src' property has been added to handle image URLs.
 */
export type Slide = {
  id: number;
  alt: string;
  bg: string;
  src?: string; // ✅ The path to the image (e.g., "/Terry1.jpg")
  content?: React.ReactNode;
};

// --- Sub-Components ---
/**
 * Renders the content for a single slide, prioritizing the 'src' image.
 */
const SlideItem: React.FC<{ slide: Slide }> = ({ slide }) => (
  // The outer div uses 'relative' position
  <div className="relative h-full w-full rounded-[calc(var(--radius)*.8)] grid place-items-center overflow-hidden">
    <div
      className="absolute inset-0 transition-colors duration-300"
      style={{ background: slide.bg }}
      aria-hidden="true"
    />

    {/* ✅ FIXED LOGIC: If 'src' exists, render standard <img> */}
    {slide.src ? (
      <Image
        src={slide.src}
        alt={slide.alt}
        fill
        className="object-contain absolute"
        sizes="(max-width: 768px) 100vw, 640px"
        unoptimized={slide.src.startsWith('data:')}
      />
    ) : slide.content ? (
      // Fallback 1: Custom React content
      slide.content
    ) : (
      // Fallback 2: Placeholder icon if no image or content is provided
      <ImageIcon size={52} className="text-[oklch(0.55_0_0)] z-10" />
    )}
  </div>
);

// --- Main Component ---
type CarouselProps = {
  slidesData: Slide[];
};

/**
 * A reusable carousel component for cycling through a list of slides.
 */
function CarouselComponent({ slidesData }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = useMemo(() => slidesData, [slidesData]);
  const currentSlide = slides[currentIndex] ?? slidesData[0]; // Ensure a fallback
  const totalSlides = slides.length;

  const prev = useCallback(() => {
    setCurrentIndex((v) => (v - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const next = useCallback(() => {
    setCurrentIndex((v) => (v + 1) % totalSlides);
  }, [totalSlides]);

  const liveMessage = `${currentSlide.alt}, Slide ${currentIndex + 1} of ${totalSlides}.`;

  return (
    // NOTE: Removed outer sizing/border styles from the CarouselComponent itself,
    // as the size is controlled by the parent container (w-full h-[250px])
    <div className="relative w-full h-full grid grid-cols-[36px_1fr_36px] items-center">

      <div className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </div>

      {/* Previous Button */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        disabled={totalSlides <= 1}
        // Adjusted button styling to fit directly inside the h-[250px] container
        className="select-none grid place-items-center w-9 h-9 text-white disabled:opacity-50 transition-opacity bg-black/30 hover:bg-black/60 rounded-full z-20 ml-2"
      >
        <ChevronLeft className='w-6 h-6' />
      </button>

      {/* Slide Content */}
      {/* This div must have full height/width to respect the parent h-[250px] container
      */}
      <div
        className="relative h-full w-full overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label="Image gallery"
      >
        <SlideItem key={currentSlide.id} slide={currentSlide} />
      </div>

      {/* Next Button */}
      <button
        onClick={next}
        aria-label="Next slide"
        disabled={totalSlides <= 1}
        className="select-none grid place-items-center w-9 h-9 text-white disabled:opacity-50 transition-opacity bg-black/30 hover:bg-black/60 rounded-full z-20 mr-2"
      >
        <ChevronRight className='w-6 h-6' />
      </button>

      {/* Indicators (Added for better UX) */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 col-span-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white shadow-lg' : 'bg-gray-400/70'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// --- Default Export for Easy Grouped Import ---
export default CarouselComponent;
