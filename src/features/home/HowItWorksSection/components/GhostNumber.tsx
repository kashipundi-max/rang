import { cn } from "@/lib/utils";

interface GhostNumberProps {
  number: number;
  /** Which edge of the column the numeral hugs (the rail side). */
  align?: "left" | "right";
  className?: string;
}

/**
 * Oversized, top-lit numeral that fills the empty half of a zig-zag row so the
 * layout never leaves a blank column opposite a card.
 */
export function GhostNumber({
  number,
  align = "left",
  className,
}: GhostNumberProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-60 items-center overflow-hidden px-6 select-none",
        align === "right" ? "justify-end" : "justify-start",
        className
      )}
    >
      <span className="font-clash-display bg-gradient-to-b from-white/70 to-white/0 bg-clip-text text-[120px] leading-none font-normal tracking-[-0.04em] text-transparent lg:text-[160px]">
        {String(number).padStart(2, "0")}
      </span>
    </div>
  );
}
