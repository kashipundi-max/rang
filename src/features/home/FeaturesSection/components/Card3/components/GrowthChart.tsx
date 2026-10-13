"use client";

export default function GrowthChart() {
  return (
    <div
      className="w-full h-full pt-6 pb-32"
      role="img"
      aria-label="Growth trend increased to 108 percent"
    >
      <svg
        viewBox="0 0 360 150"
        className="h-full w-full overflow-visible"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="featureGrowthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-brand-primary-light)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="var(--color-brand-primary-light)" stopOpacity="0.1" />
            <stop offset="95%" stopColor="var(--color-brand-primary-light)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="featureGrowthStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.5" />
            <stop offset="50%" stopColor="var(--color-brand-primary-light)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        {[36, 72, 108].map((y) => (
          <line
            key={y}
            x1="0"
            x2="360"
            y1={y}
            y2={y}
            stroke="var(--color-card-highlight-bg)"
            strokeOpacity="0.3"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path
          d="M 0 132 C 45 127, 66 116, 92 113 S 148 95, 178 92 S 234 61, 270 58 S 330 28, 360 22 L 360 150 L 0 150 Z"
          fill="url(#featureGrowthFill)"
        />
        <path
          d="M 0 132 C 45 127, 66 116, 92 113 S 148 95, 178 92 S 234 61, 270 58 S 330 28, 360 22"
          fill="none"
          stroke="url(#featureGrowthStroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="180"
          x2="180"
          y1="72"
          y2="150"
          stroke="var(--color-brand-primary)"
          strokeDasharray="4 4"
          strokeOpacity="0.6"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="180" cy="72" r="7" fill="var(--color-card-surface)" stroke="var(--color-brand-primary-light)" strokeWidth="3" />
      </svg>
    </div>
  );
}
