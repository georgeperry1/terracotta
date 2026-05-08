import { useState } from 'react';
import { Loader2, Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MovieCard from '@/components/MovieCard';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useMovieSearch } from '@/hooks/useMovieSearch';
import { yearOf } from '@/lib/tmdb';

export default function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmed = debouncedQuery.trim();
  const { data, isFetching, isError, error } = useMovieSearch(debouncedQuery);

  const showInitial = trimmed.length < 2;
  const results = data?.results ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>

      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          inputMode="search"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          placeholder="Search for a movie…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-10"
          aria-label="Search for a movie"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showInitial && (
        <p className="text-sm text-muted-foreground">
          Type at least two characters to search TMDB.
        </p>
      )}

      {!showInitial && isFetching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching…
        </div>
      )}

      {!showInitial && isError && (
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error ? error.message : 'Search failed.'}
        </p>
      )}

      {!showInitial && !isFetching && !isError && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No matches for “{trimmed}”.
        </p>
      )}

      {results.length > 0 && (
        <ul className="divide-y divide-border">
          {results.map((m) => (
            <li key={m.id} className="py-1">
              <MovieCard
                tmdbId={m.id}
                title={m.title}
                year={yearOf(m.release_date)}
                posterPath={m.poster_path}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
