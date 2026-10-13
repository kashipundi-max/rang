import { HERO_3D_IMAGE } from "../config";
import { getBrandFilter } from "../utils";

export function SphereImage() {
  const brandFilter = getBrandFilter();

  return (
    <div className="relative z-10 flex justify-center m-auto mt-0 sm:mt-6 md:mt-8 h-[60vw] w-[60vw] sm:h-[70vw] sm:w-[70vw] md:h-[80vw] md:w-[80vw] max-w-[967px] max-h-[967px]">
      {/* Static glow: a radial gradient, not a blurred disc. */}
      <div className="absolute w-full h-full max-w-[967px] max-h-[967px] z-0 -top-10 sm:-top-15 md:-top-20 left-1/2 -translate-x-1/2">
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-brand-glow) 62%, transparent) 0%, color-mix(in srgb, var(--color-brand-glow) 50%, transparent) 28%, color-mix(in srgb, var(--color-brand-glow) 30%, transparent) 50%, color-mix(in srgb, var(--color-brand-glow) 12%, transparent) 70%, transparent 90%)",
          }}
        />
      </div>

      <div
        className="h-full w-full bg-center bg-no-repeat relative z-10"
        style={{
          backgroundImage: `url('${HERO_3D_IMAGE}')`,
          backgroundSize: "100% 100%",
          filter: brandFilter,
        }}
      />
    </div>
  );
}
