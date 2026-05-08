import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export default function Avatar({ src, name, size = 40, className }: AvatarProps) {
  const initial = name.trim().slice(0, 1).toUpperCase() || '?';

  return (
    <div
      style={{ height: size, width: size, fontSize: Math.round(size * 0.4) }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground font-semibold uppercase',
        className,
      )}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </div>
  );
}
