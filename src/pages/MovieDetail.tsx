import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Film, Loader2 } from 'lucide-react';
import { useMovieDetails } from '@/hooks/useMovieDetails';
import { directorOf, posterUrl, yearOf } from '@/lib/tmdb';

export default function MovieDetail() {
  const { tmdbId: tmdbIdParam } = useParams<{ tmdbId: string }>();
  const tmdbId = Number(tmdbIdParam);
  const { data, isLoading, isError, error } = useMovieDetails(
    Number.isFinite(tmdbId) ? tmdbId : null,
  );

  return (
    <section className="space-y-4">
      <Link
        to="/search"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error ? error.message : 'Could not load movie.'}
        </p>
      )}

      {data && (
        <article className="space-y-4">
          <div className="flex gap-4">
            <div className="h-40 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
              {posterUrl(data.poster_path, 'w342') ? (
                <img
                  src={posterUrl(data.poster_path, 'w342')!}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Film className="h-8 w-8" aria-hidden />
                </div>
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-xl font-semibold leading-tight">
                {data.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {[
                  yearOf(data.release_date),
                  directorOf(data),
                  data.runtime ? `${data.runtime} min` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.genres.map((g) => g.name).join(', ')}
              </p>
            </div>
          </div>

          {data.overview && (
            <p className="text-sm leading-relaxed text-foreground/90">
              {data.overview}
            </p>
          )}

          <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
            Rating, watchlist, and queue actions land in the next step.
          </p>
        </article>
      )}
    </section>
  );
}
