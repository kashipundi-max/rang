interface ChatHeaderProps {
  title: string;
}

export default function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <h3 className="text-white/90 text-sm font-medium">{title}</h3>
        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary-light shadow-[0_0_8px_var(--color-card-glow)]" />
      </div>
    </div>
  );
}
