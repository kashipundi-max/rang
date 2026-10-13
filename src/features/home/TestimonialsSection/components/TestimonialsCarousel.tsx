import TestimonialCard from "./TestimonialCard";
import CarouselNavButton from "./CarouselNavButton";
import { TranslatedTestimonial } from "../config/types";

type EmblaRefType = <ViewportElement extends HTMLElement>(
  instance: ViewportElement | null
) => void;

interface TestimonialsCarouselProps {
  emblaRef: EmblaRefType;
  testimonials: TranslatedTestimonial[];
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onScrollPrev: () => void;
  onScrollNext: () => void;
}

export default function TestimonialsCarousel({
  emblaRef,
  testimonials,
  canScrollPrev,
  canScrollNext,
  onScrollPrev,
  onScrollNext,
}: TestimonialsCarouselProps) {
  return (
    <div className="overflow-hidden relative">
      {/* Start gradient overlay (left in LTR, right in RTL) */}
      <div className="absolute start-0 top-0 w-8 sm:w-16 md:w-24 h-full bg-linear-to-r rtl:bg-linear-to-l from-bg-dark via-bg-dark/80 to-transparent z-10 pointer-events-none" />

      {/* End gradient overlay (right in LTR, left in RTL) */}
      <div className="absolute end-0 top-0 w-8 sm:w-16 md:w-24 h-full bg-linear-to-l rtl:bg-linear-to-r from-bg-dark via-bg-dark/80 to-transparent z-10 pointer-events-none" />

      {/* Navigation Arrows */}
      <CarouselNavButton
        direction="prev"
        onClick={onScrollPrev}
        disabled={!canScrollPrev}
      />
      <CarouselNavButton
        direction="next"
        onClick={onScrollNext}
        disabled={!canScrollNext}
      />

      <div className="embla group" ref={emblaRef}>
        <div className="embla__container flex">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.uniqueKey}
              className="embla__slide flex-none w-[90%] sm:w-[70%] md:w-[50%] lg:w-[33.333%] min-w-0 px-2 sm:px-3 md:px-4"
            >
              <TestimonialCard
                name={testimonial.name}
                role={testimonial.role}
                company={testimonial.company}
                content={testimonial.content}
                avatar={testimonial.avatar}
                rating={testimonial.rating}
                roleAtCompany={testimonial.roleAtCompany}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
