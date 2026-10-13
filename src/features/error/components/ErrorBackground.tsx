export function ErrorBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-brand-glow/10 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--color-brand-primary) 1px, transparent 1px),
                            linear-gradient(90deg, var(--color-brand-primary) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
