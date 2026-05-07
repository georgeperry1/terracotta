import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const STARS = 10;

type Fill = 'empty' | 'half' | 'full';

interface StarIconProps {
  fill: Fill;
  className?: string;
}

function StarIcon({ fill, className }: StarIconProps) {
  return (
    <span className={cn('relative inline-block', className)} aria-hidden>
      <Star className="h-full w-full text-muted-foreground" strokeWidth={1.5} />
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: fill === 'full' ? '100%' : fill === 'half' ? '50%' : '0%' }}
      >
        <Star
          className="h-full w-full fill-primary text-primary"
          strokeWidth={1.5}
        />
      </span>
    </span>
  );
}

function fillFor(value: number | null, position: number): Fill {
  if (value == null) return 'empty';
  if (value >= position) return 'full';
  if (value >= position - 0.5) return 'half';
  return 'empty';
}

interface StarRatingInputProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  starSize?: number;
  className?: string;
}

export function StarRatingInput({
  value,
  onChange,
  disabled,
  starSize = 32,
  className,
}: StarRatingInputProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Rating, half a star to ten stars"
      className={cn('flex items-center', className)}
    >
      {Array.from({ length: STARS }, (_, i) => {
        const position = i + 1;
        const halfScore = position - 0.5;
        const fullScore = position;
        return (
          <span
            key={position}
            className="relative inline-block"
            style={{ height: starSize, width: starSize }}
          >
            <StarIcon fill={fillFor(value, position)} className="h-full w-full" />
            <button
              type="button"
              role="radio"
              aria-checked={value === halfScore}
              aria-label={`Rate ${halfScore.toFixed(1)} out of 10`}
              disabled={disabled}
              onClick={() => onChange(halfScore)}
              className="absolute inset-y-0 left-0 w-1/2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              role="radio"
              aria-checked={value === fullScore}
              aria-label={`Rate ${fullScore} out of 10`}
              disabled={disabled}
              onClick={() => onChange(fullScore)}
              className="absolute inset-y-0 right-0 w-1/2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
            />
          </span>
        );
      })}
    </div>
  );
}

interface StarRatingDisplayProps {
  value: number | null;
  starSize?: number;
  className?: string;
}

export function StarRatingDisplay({
  value,
  starSize = 16,
  className,
}: StarRatingDisplayProps) {
  return (
    <div
      className={cn('flex items-center', className)}
      aria-label={value == null ? 'Not rated' : `${value.toFixed(1)} out of 10`}
    >
      {Array.from({ length: STARS }, (_, i) => (
        <span
          key={i + 1}
          className="inline-block"
          style={{ height: starSize, width: starSize }}
        >
          <StarIcon fill={fillFor(value, i + 1)} className="h-full w-full" />
        </span>
      ))}
    </div>
  );
}
