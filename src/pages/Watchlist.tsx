import { Link } from 'react-router-dom';
import { Film, Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  useRemoveFromWatchlist,
  useWatchlistList,
  type WatchlistListEntry,
} from '@/hooks/useWatchlist';
import { posterUrl } from '@/lib/tmdb';
import { relativeTime } from '@/lib/time';

export default function Watchlist() {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: entries = [], isLoading, isError, error } = useWatchlistList(userId);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
        <p className="text-sm text-muted-foreground">
          Films you’ve marked to watch.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error ? error.message : 'Could not load watchlist.'}
        </p>
      )}

      {!isLoading && !isError && entries.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Your watchlist is empty. Find something to save.
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link to="/search">
              <Search className="h-4 w-4" /> Search
            </Link>
          </Button>
        </div>
      )}

      {entries.length > 0 && userId && (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <WatchlistRow key={entry.id} entry={entry} userId={userId} />
          ))}
        </ul>
      )}
    </section>
  );
}

function WatchlistRow({
  entry,
  userId,
}: {
  entry: WatchlistListEntry;
  userId: string;
}) {
  const remove = useRemoveFromWatchlist();
  if (!entry.movies) return null;

  const poster = posterUrl(entry.movies.poster_path, 'w185');

  return (
    <li className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <Link
        to={`/movie/${entry.movies.tmdb_id}`}
        className="flex flex-1 items-start gap-3 min-w-0"
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
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-medium leading-tight">
            {entry.movies.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {[entry.movies.year, entry.movies.director]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="text-xs text-muted-foreground">
            Added {relativeTime(entry.added_at)}
          </p>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        aria-label="Remove from watchlist"
        disabled={remove.isPending}
        onClick={() =>
          remove.mutate({ tmdbId: entry.movies!.tmdb_id, userId })
        }
      >
        {remove.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </li>
  );
}
