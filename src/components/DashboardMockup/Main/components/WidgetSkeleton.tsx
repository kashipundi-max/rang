export const WidgetSkeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`relative h-full w-full rounded-xl border border-brand-border/50 p-6 bg-brand-surface/60 ${className}`}
  >
    <div className="animate-pulse h-full w-full bg-brand-surface/50 rounded" />
  </div>
);
