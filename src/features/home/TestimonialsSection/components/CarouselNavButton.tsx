interface NavButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}

export default function CarouselNavButton({
  direction,
  onClick,
  disabled,
}: NavButtonProps) {
  const isPrev = direction === "prev";

  return (
    <button
      className={`absolute ${
        isPrev ? "start-2 sm:start-4" : "end-2 sm:end-4"
      } top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-brand-surface/80 hover:bg-surface-hover/80 transition-colors rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 lg:opacity-100 disabled:opacity-30`}
      onClick={onClick}
      disabled={disabled}
    >
      <svg
        className="w-4 h-4 text-white rtl:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={isPrev ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  );
}
