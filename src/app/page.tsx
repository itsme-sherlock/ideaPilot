'use client';

import { useState } from 'react';
import { IdeaForm } from '@/components/idea-form';
import { Lightbulb } from 'lucide-react';
import { TypingText } from '@/components/typing-text';

export default function Home() {
  const [showExample, setShowExample] = useState(false);

  // ✅ Build base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002";

  // ✅ Example slugs
  const exampleSlug1 = "learn-ai-skills-in-15-minutes-a-day";
  const exampleSlug2 = "pre-order-yoga-mats-made-entirely-from-ocean-plastic";
  const exampleSlug3 = "local-coffee-subscription";

  // ✅ Build URLs
  const publicUrl1 = `${baseUrl}/p/${exampleSlug1}`;
  const publicUrl2 = `${baseUrl}/p/${exampleSlug2}`;
  const publicUrl3 = `${baseUrl}/p/${exampleSlug3}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-md md:max-w-2xl text-center space-y-6">

        {/* Branding */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium shadow-sm">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
            <span>IdeaPilot</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          Validate Your Startup Idea in 60 Seconds
        </h1>

        {/* Subheadline */}
        <TypingText />

        {/* Example Links */}
        <div className="text-sm text-muted-foreground">
          See what it creates:
          <ul className="list-none space-y-2">
            <li>
              <a href={publicUrl1} className="text-primary hover:text-primary-dark transition-colors">
                AI Course for Busy Parents
              </a>
            </li>
            <li>
              <a href={publicUrl2} className="text-primary hover:text-primary-dark transition-colors">
                Sustainable Yoga Mats
              </a>
            </li>
            <li>
              <a href={publicUrl3} className="text-primary hover:text-primary-dark transition-colors">
                Local Coffee Subscription
              </a>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Free • No signup required • Ready in 60 seconds
          </p>
        </div>
        <div className="pt-2">
          <IdeaForm />
        </div>

        {/* "How it works" button */}
        <p className="text-sm">
          <button type="button" onClick={() => setShowExample((prev) => !prev)}>
            How it works
          </button>
        </p>
      </div>
    </main>
  );
}
