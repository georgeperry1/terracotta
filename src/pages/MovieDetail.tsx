import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Film,
  ListPlus,
  ListVideo,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  StarRatingDisplay,
  StarRatingInput,
} from '@/components/StarRatingInput';
import { useAuth } from '@/hooks/useAuth';
import { useMovieDetails } from '@/hooks/useMovieDetails';
import { useProfiles, type Profile } from '@/hooks/useProfiles';
import {
  useClearRating,
  useMovieRatings,
  useRateMovie,
  type Rating,
} from '@/hooks/useRatings';
import { useIsInWatchlist, useToggleWatchlist } from '@/hooks/useWatchlist';
import { useAddToQueue, useQueueEntry } from '@/hooks/useQueue';
import { directorOf, posterUrl, yearOf, type TmdbMovieDetails } from '@/lib/tmdb';

export default function MovieDetail() {
  const navigate = useNavigate();
  const { tmdbId: tmdbIdParam } = useParams<{ tmdbId: string }>();
  const tmdbId = Number(tmdbIdParam);
  const validId = Number.isFinite(tmdbId);

  const { user } = useAuth();
  const { data: details, isLoading, isError, error } = useMovieDetails(
    validId ? tmdbId : null,
  );

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

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

      {details && user && (
        <Loaded details={details} userId={user.id} />
      )}
    </section>
  );
}

interface LoadedProps {
  details: TmdbMovieDetails;
  userId: string;
}

function Loaded({ details, userId }: LoadedProps) {
  const { data: profiles = [] } = useProfiles();
  const { data: ratings = [] } = useMovieRatings(details.id);
  const { data: queueEntry } = useQueueEntry(details.id);
  const { data: inWatchlist } = useIsInWatchlist(details.id, userId);

  const rate = useRateMovie();
  const clearRating = useClearRating();
  const toggleWatchlist = useToggleWatchlist();
  const addToQueue = useAddToQueue();

  const myRating = ratings.find((r) => r.user_id === userId) ?? null;

  const otherProfiles = profiles.filter((p) => p.id !== userId);

  const isQueued = !!queueEntry;
  const queuedByMe = queueEntry?.added_by === userId;

  return (
    <article className="space-y-6">
      <header className="flex gap-4">
        <Poster path={details.poster_path} />
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold leading-tight">{details.title}</h1>
          <p className="text-sm text-muted-foreground">
            {[
              yearOf(details.release_date),
              directorOf(details),
              details.runtime ? `${details.runtime} min` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {details.genres.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {details.genres.map((g) => g.name).join(', ')}
            </p>
          )}
        </div>
      </header>

      {details.overview && (
        <p className="text-sm leading-relaxed text-foreground/90">
          {details.overview}
        </p>
      )}

      <section aria-label="Ratings" className="space-y-4 rounded-lg border bg-card p-4">
        <YourRating
          value={myRating?.score ?? null}
          submitting={rate.isPending}
          clearing={clearRating.isPending}
          onRate={(score) =>
            rate.mutate({ details, userId, score })
          }
          onClear={() =>
            clearRating.mutate({ tmdbId: details.id, userId })
          }
        />

        {otherProfiles.map((profile) => (
          <PartnerRating
            key={profile.id}
            profile={profile}
            rating={ratings.find((r) => r.user_id === profile.id) ?? null}
          />
        ))}

        {(rate.isError || clearRating.isError) && (
          <p className="text-sm text-destructive" role="alert">
            {(rate.error ?? clearRating.error) instanceof Error
              ? (rate.error ?? clearRating.error)!.message
              : 'Could not save rating.'}
          </p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Button
          variant={inWatchlist ? 'secondary' : 'outline'}
          size="lg"
          disabled={toggleWatchlist.isPending}
          onClick={() =>
            toggleWatchlist.mutate({
              details,
              userId,
              desired: !inWatchlist,
            })
          }
        >
          {toggleWatchlist.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : inWatchlist ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {inWatchlist ? 'In watchlist' : 'Watchlist'}
        </Button>

        <Button
          variant={isQueued ? 'secondary' : 'outline'}
          size="lg"
          disabled={isQueued || addToQueue.isPending}
          onClick={() => addToQueue.mutate({ details, userId })}
        >
          {addToQueue.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isQueued ? (
            <ListVideo className="h-4 w-4" />
          ) : (
            <ListPlus className="h-4 w-4" />
          )}
          {isQueued ? (queuedByMe ? 'In queue' : 'In queue') : 'Add to queue'}
        </Button>
      </section>

      {(toggleWatchlist.isError || addToQueue.isError) && (
        <p className="text-sm text-destructive" role="alert">
          {(toggleWatchlist.error ?? addToQueue.error) instanceof Error
            ? (toggleWatchlist.error ?? addToQueue.error)!.message
            : 'Could not save change.'}
        </p>
      )}
    </article>
  );
}

function Poster({ path }: { path: string | null }) {
  const url = posterUrl(path, 'w342');
  return (
    <div className="h-40 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <Film className="h-8 w-8" aria-hidden />
        </div>
      )}
    </div>
  );
}

interface YourRatingProps {
  value: number | null;
  submitting: boolean;
  clearing: boolean;
  onRate: (score: number) => void;
  onClear: () => void;
}

function YourRating({
  value,
  submitting,
  clearing,
  onRate,
  onClear,
}: YourRatingProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Your rating</p>
        <p className="text-sm tabular-nums text-muted-foreground">
          {value == null ? '—' : value.toFixed(1)}
        </p>
      </div>
      <StarRatingInput
        value={value}
        disabled={submitting}
        onChange={onRate}
        starSize={28}
      />
      {value != null && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          disabled={clearing}
          onClick={onClear}
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}

interface PartnerRatingProps {
  profile: Profile;
  rating: Rating | null;
}

function PartnerRating({ profile, rating }: PartnerRatingProps) {
  return (
    <div className="space-y-2 border-t border-border pt-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{profile.display_name}</p>
        <p className="text-sm tabular-nums text-muted-foreground">
          {rating ? rating.score.toFixed(1) : 'No rating yet'}
        </p>
      </div>
      <StarRatingDisplay value={rating?.score ?? null} starSize={20} />
    </div>
  );
}
