"use client";

interface NavHighlightProps {
  left: number;
  width: number;
  opacity: number;
  minWidth?: number;
}

export function NavHighlight({
  left,
  width,
  opacity,
  minWidth = 90,
}: NavHighlightProps) {
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 h-[calc(100%+8px)] rounded-full pointer-events-none transition-all duration-300 ease-out"
      style={{
        left,
        width: Math.max(width, minWidth),
        opacity,
        background: "rgba(255, 255, 255, 0.1)",
        boxShadow:
          "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Inner glow effect */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.07) 100%)",
        }}
      />
    </div>
  );
}
