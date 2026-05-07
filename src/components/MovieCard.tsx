import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { posterUrl } from '@/lib/tmdb';

export interface MovieCardProps {
  tmdbId: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  rightSlot?: React.ReactNode;
}

export default function MovieCard({
  tmdbId,
  title,
  year,
  posterPath,
  rightSlot,
}: MovieCardProps) {
  const poster = posterUrl(posterPath, 'w185');

  return (
    <Link
      to={`/movie/${tmdbId}`}
      className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-accent active:bg-accent/80 transition-colors"
    >
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Film className="h-6 w-6" aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">{title}</p>
        {year != null && (
          <p className="text-xs text-muted-foreground">{year}</p>
        )}
      </div>
      {rightSlot}
    </Link>
  );
}
