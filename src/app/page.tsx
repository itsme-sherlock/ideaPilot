import { IdeaForm } from '@/components/idea-form';
import { Rocket } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full p-3 mb-4">
            <Rocket className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-headline">
            IdeaPilot
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Turn your spark of an idea into a live landing page in 60 seconds.
          </p>
        </div>
        <IdeaForm />
      </div>
    </main>
  );
}
