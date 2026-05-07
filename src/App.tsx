import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function App() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-primary/10 p-4 text-primary">
            <Film className="h-8 w-8" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-primary">
            terracotta
          </h1>
          <p className="text-muted-foreground">
            A private movie rating library for George &amp; Isabelle.
          </p>
        </div>
        <Button className="w-full" size="lg">
          Get started
        </Button>
      </div>
    </main>
  );
}
