import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Me() {
  const { user, signOut } = useAuth();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Me</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </header>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          void signOut();
        }}
      >
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </section>
  );
}
