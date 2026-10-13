import Image from "next/image";
import { TestimonialCardProps } from "../config/types";

export default function TestimonialCard({
  name,
  content,
  avatar,
  rating,
  roleAtCompany,
}: TestimonialCardProps) {
  return (
    // No backdrop-blur here on purpose. These cards carried `backdrop-blur-3xl`
    // (a 64px backdrop filter) over a 90%-opaque fill, sitting on a flat
    // `bg-bg-dark` section - so the blur had nothing to reveal and was
    // invisible either way. It was not free, though: 18 cards in an
    // auto-scrolling carousel meant 18 backdrop re-snapshots every frame the
    // carousel moved, which was the single most expensive thing on the page.
    <div className="bg-bg-card/90 border border-border-secondary rounded-xl p-4 sm:p-6 w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none h-[180px] sm:h-[220px] flex flex-col">
      {/* Rating Stars */}
      <div className="flex gap-1 mb-3 sm:mb-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 ${
              i < rating ? "text-brand-primary-light" : "text-border-primary"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Testimonial Content */}
      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1 overflow-hidden">
        &ldquo;{content}&rdquo;
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-2 sm:gap-3 mt-auto">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0">
          <Image src={avatar} alt={name} fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <h4 className="text-white font-medium text-xs sm:text-sm truncate">
            {name}
          </h4>
          <p className="text-gray-400 text-xs truncate">{roleAtCompany}</p>
        </div>
      </div>
    </div>
  );
}
