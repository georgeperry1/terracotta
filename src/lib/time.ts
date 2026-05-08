// Tiny relative-time formatter using built-in Intl. Returns strings
// like "just now", "5 minutes ago", "2 days ago".
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.round(diffMs / 1000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffSec) < 45) {
    return diffSec >= 0 ? 'just now' : rtf.format(-diffSec, 'second');
  }
  const minutes = Math.round(diffSec / 60);
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute');

  const hours = Math.round(diffSec / 3600);
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');

  const days = Math.round(diffSec / 86400);
  if (Math.abs(days) < 30) return rtf.format(-days, 'day');

  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(-months, 'month');

  const years = Math.round(days / 365);
  return rtf.format(-years, 'year');
}
