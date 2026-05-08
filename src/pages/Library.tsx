import { Link } from 'react-router-dom';
import { Film, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLibrary, type LibraryEntry } from '@/hooks/useLibrary';
import { useProfiles, type Profile } from '@/hooks/useProfiles';
import { posterUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

export default function Library() {
  const { data: entries = [], isLoading, isError, error } = useLibrary();
  const { data: profiles = [] } = useProfiles();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Library</h1>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error ? error.message : 'Could not load library.'}
        </p>
      )}

      {!isLoading && !isError && entries.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Nothing rated yet. Find a film to get started.
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link to="/search">
              <Search className="h-4 w-4" /> Search
            </Link>
          </Button>
        </div>
      )}

      {entries.length > 0 && (
        <ul className="divide-y divide-border">
          {entries.map((entry) => (
            <li key={entry.movie.tmdb_id} className="py-2">
              <LibraryRow entry={entry} profiles={profiles} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface LibraryRowProps {
  entry: LibraryEntry;
  profiles: Profile[];
}

function LibraryRow({ entry, profiles }: LibraryRowProps) {
  const poster = posterUrl(entry.movie.poster_path, 'w185');
  return (
    <Link
      to={`/movie/${entry.movie.tmdb_id}`}
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
        <p className="truncate text-sm font-medium leading-tight">
          {entry.movie.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[entry.movie.year, entry.movie.director].filter(Boolean).join(' · ')}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {profiles.map((profile) => {
          const rating = entry.ratings.find((r) => r.user_id === profile.id);
          return (
            <ScoreChip
              key={profile.id}
              initial={profile.display_name.slice(0, 1).toUpperCase()}
              score={rating?.score ?? null}
              label={profile.display_name}
            />
          );
        })}
      </div>
    </Link>
  );
}

interface ScoreChipProps {
  initial: string;
  score: number | null;
  label: string;
}

function ScoreChip({ initial, score, label }: ScoreChipProps) {
  const rated = score != null;
  return (
    <div
      aria-label={
        rated ? `${label}: ${score!.toFixed(1)} out of 10` : `${label}: not rated`
      }
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs',
        rated ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground',
      )}
    >
      <span aria-hidden className="font-semibold">
        {initial}
      </span>
      <span className="tabular-nums">{rated ? score!.toFixed(1) : '—'}</span>
    </div>
  );
}
