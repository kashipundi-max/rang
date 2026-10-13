import { FloatingCards, HeroContent, SphereImage } from "./components";

// Fully static hero: no light-ray cones, entrance fades or looping motion, so
// the first screen paints in one pass instead of animating in over ~3s.
export default function HeroSection() {
  return (
    <section className="relative w-full bg-bg-dark">
      {/* Soft top glow — a plain gradient, costs nothing to paint. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 0%, color-mix(in srgb, var(--color-brand-glow) 22%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative h-[540px] sm:h-[500px] md:h-[600px] lg:h-[670px] w-full overflow-hidden">
        <div className="absolute h-full max-w-[1350px] top-0 left-1/2 -translate-x-1/2 w-full bg-transparent z-0">
          <FloatingCards />
        </div>

        <HeroContent />
        <SphereImage />
      </div>
    </section>
  );
}
