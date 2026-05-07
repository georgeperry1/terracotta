import { Link } from 'react-router-dom';
import {
  Film,
  Loader2,
  Search,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles, type Profile } from '@/hooks/useProfiles';
import {
  useQueueList,
  useRemoveFromQueue,
  useSetPartnerVote,
  type QueueListEntry,
} from '@/hooks/useQueue';
import { posterUrl } from '@/lib/tmdb';
import { relativeTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { QueueVote } from '@/lib/database.types';

export default function Queue() {
  const { user } = useAuth();
  const { data: entries = [], isLoading, isError, error } = useQueueList();
  const { data: profiles = [] } = useProfiles();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
        <p className="text-sm text-muted-foreground">
          Films to watch together — oldest first.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error ? error.message : 'Could not load queue.'}
        </p>
      )}

      {!isLoading && !isError && entries.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Queue’s empty. Find a film to add.
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link to="/search">
              <Search className="h-4 w-4" /> Search
            </Link>
          </Button>
        </div>
      )}

      {entries.length > 0 && user && (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <QueueRowItem
              key={entry.id}
              entry={entry}
              profiles={profiles}
              currentUserId={user.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface QueueRowItemProps {
  entry: QueueListEntry;
  profiles: Profile[];
  currentUserId: string;
}

function QueueRowItem({ entry, profiles, currentUserId }: QueueRowItemProps) {
  const setVote = useSetPartnerVote();
  const remove = useRemoveFromQueue();

  if (!entry.movies) return null;

  const adder = profiles.find((p) => p.id === entry.added_by);
  const partner = profiles.find((p) => p.id !== entry.added_by);
  const youAdded = entry.added_by === currentUserId;

  function vote(next: QueueVote) {
    const cleared = entry.partner_vote === next ? null : next;
    setVote.mutate({ queueId: entry.id, vote: cleared });
  }

  return (
    <li className="rounded-lg border bg-card p-3">
      <div className="flex items-start gap-3">
        <Link
          to={`/movie/${entry.movies.tmdb_id}`}
          className="flex flex-1 items-start gap-3 min-w-0"
        >
          <Poster path={entry.movies.poster_path} />
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
              Added by {adder?.display_name ?? 'someone'} ·{' '}
              {relativeTime(entry.added_at)}
            </p>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Remove from queue"
          disabled={remove.isPending}
          onClick={() => remove.mutate(entry.id)}
        >
          {remove.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        {youAdded ? (
          <PartnerVoteBadge vote={entry.partner_vote} partner={partner} />
        ) : (
          <PartnerVoteControls
            vote={entry.partner_vote}
            disabled={setVote.isPending}
            onVote={vote}
          />
        )}
      </div>
    </li>
  );
}

function Poster({ path }: { path: string | null }) {
  const url = posterUrl(path, 'w185');
  return (
    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
      {url ? (
        <img
          src={url}
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
  );
}

function PartnerVoteBadge({
  vote,
  partner,
}: {
  vote: QueueVote | null;
  partner: Profile | undefined;
}) {
  const partnerName = partner?.display_name ?? 'Partner';
  if (vote === 'up') {
    return (
      <Pill tone="positive">
        <ThumbsUp className="h-3.5 w-3.5" /> {partnerName}
      </Pill>
    );
  }
  if (vote === 'down') {
    return (
      <Pill tone="negative">
        <ThumbsDown className="h-3.5 w-3.5" /> {partnerName}
      </Pill>
    );
  }
  return (
    <p className="text-xs text-muted-foreground">
      Awaiting {partnerName}’s vote
    </p>
  );
}

function PartnerVoteControls({
  vote,
  disabled,
  onVote,
}: {
  vote: QueueVote | null;
  disabled: boolean;
  onVote: (next: QueueVote) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant={vote === 'up' ? 'default' : 'outline'}
        className="h-9 w-9"
        aria-label="Thumbs up"
        aria-pressed={vote === 'up'}
        disabled={disabled}
        onClick={() => onVote('up')}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant={vote === 'down' ? 'destructive' : 'outline'}
        className="h-9 w-9"
        aria-label="Thumbs down"
        aria-pressed={vote === 'down'}
        disabled={disabled}
        onClick={() => onVote('down')}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Pill({
  tone,
  children,
}: {
  tone: 'positive' | 'negative';
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
        tone === 'positive'
          ? 'bg-primary/15 text-primary'
          : 'bg-destructive/15 text-destructive',
      )}
    >
      {children}
    </span>
  );
}
