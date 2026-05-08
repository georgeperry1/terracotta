import { NavLink } from 'react-router-dom';
import { Film, ListVideo, Bookmark, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/', label: 'Library', icon: Film, end: true },
  { to: '/queue', label: 'Queue', icon: ListVideo, end: false },
  { to: '/watchlist', label: 'Watchlist', icon: Bookmark, end: false },
  { to: '/search', label: 'Search', icon: Search, end: false },
  { to: '/me', label: 'Me', icon: User, end: false },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex h-16 w-full flex-col items-center justify-center gap-0.5 text-xs',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
