import DustParticlesWebGL from "./DustParticlesWebGL";
import { getBrandFilter } from "@/features/home/HeroSection/utils";

interface AnimatedHeaderBackgroundProps {
  className?: string;
  enableTopFade?: boolean;
  enableBottomFade?: boolean;
  enableSvgBackground?: boolean;
}

export default function AnimatedHeaderBackground({
  className = "",
  enableTopFade = true,
  enableBottomFade = true,
  enableSvgBackground = true,
}: AnimatedHeaderBackgroundProps) {
  const brandFilter = getBrandFilter();

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ pointerEvents: "none" }}
    >
      {/* SVG Background */}
      {enableSvgBackground && (
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/images/section2/HeaderBgPattern.svg')",
            filter: brandFilter,
          }}
        />
      )}
      {/* Center glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 40% 100% at 50% 50%, color-mix(in srgb, var(--color-brand-primary) 12%, transparent) 0%, color-mix(in srgb, var(--color-brand-primary) 6%, transparent) 40%, color-mix(in srgb, var(--color-brand-primary) 2%, transparent) 70%, transparent 100%)",
        }}
      />
      {/* Top fade */}
      {enableTopFade && (
        <div
          className="absolute inset-x-0 top-0 h-[40%]"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-bg-dark) 0%, color-mix(in srgb, var(--color-bg-dark) 50%, transparent) 50%, transparent 100%)",
          }}
        />
      )}
      {/* Bottom fade */}
      {enableBottomFade && (
        <div
          className="absolute inset-x-0 bottom-0 h-[40%]"
          style={{
            background:
              "linear-gradient(to top, var(--color-bg-dark) 0%, color-mix(in srgb, var(--color-bg-dark) 50%, transparent) 50%, transparent 100%)",
          }}
        />
      )}
      {/* Dust particles - constrained to center */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[130px] overflow-hidden">
        <DustParticlesWebGL enabled={true} />
      </div>
    </div>
  );
}
