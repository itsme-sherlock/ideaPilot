'use client';

import { useState } from 'react';
import { IdeaForm } from '@/components/idea-form';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { TypingText } from '@/components/typing-text';

export default function Home() {
  const [showExample, setShowExample] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      {/* Branding Section */}
      <div className="w-full max-w-md md:max-w-2xl text-center space-y-6">
        {/* Brand Name and Icon */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium shadow-sm">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
            <span>IdeaPilot</span>
          </div>
        </div>

        {/* Stronger Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          Validate Your Startup Idea in 60 Seconds
        </h1>

        {/* Dynamic Subheadline */}
        <TypingText />

        {/* Simple, Clear CTA Setup */}
        <div className="space-y-3">
          {/* Risk Reduction */}
          <p className="text-xs text-muted-foreground">
            Free • No signup required • Ready in 60 seconds
          </p>
        </div>

        {/* Main CTA - Maximum Visual Weight */}
        <div className="pt-2">
          <IdeaForm />
        </div>

        {/* "How It Works" Button */}
        <p className="text-sm">
          <button
            type="button"
            onClick={() => setShowExample((prev) => !prev)}
            className="text-primary hover:underline font-medium inline-flex items-center"
          >
            {showExample ? 'Hide how it works' : 'How does this work?'}
            <ArrowRight
              className={`ml-1 h-4 w-4 transition-transform duration-200 ${showExample ? 'rotate-90' : ''}`}
            />
          </button>
        </p>

        {/* How It Works Section */}
        {showExample && (
          <div className="mt-4 text-left bg-muted/50 p-4 rounded-lg border border-muted shadow-sm space-y-4">
            <p className="text-sm font-medium text-foreground text-center mb-4">
              Here's exactly what happens:
            </p>

            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-semibold text-foreground">You describe your idea</h3>
                <p className="text-sm text-muted-foreground">
                  Type something like: "An AI-powered yoga app for busy moms"
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-semibold text-foreground">We generate your landing page</h3>
                <p className="text-sm text-muted-foreground">
                  AI creates headlines, descriptions, and a clean page design in 60 seconds
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-semibold text-foreground">You get a shareable link</h3>
                <p className="text-sm text-muted-foreground">
                  Something like: <span className="font-mono bg-background px-1 rounded">/p/ai-yoga-moms</span>
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Share and validate</h3>
                <p className="text-sm text-muted-foreground">
                  Post it anywhere - Twitter, Reddit, Facebook groups. Collect signups and feedback.
                </p>
              </div>
            </div>

            {/* What you get */}
            <div className="bg-background rounded p-3 border-l-2 border-primary/30 mt-4">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">What you'll have:</span> A live page with email signup, 
                feedback buttons, and a simple dashboard to track interest - all before writing a single line of code.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Soft Background Decoration (Desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 hidden md:block"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
          `,
        }}
      />
    </main>
  );
}