'use client';

import { useState } from 'react';
import { IdeaForm } from '@/components/idea-form';
import { Lightbulb } from 'lucide-react';
import { TypingText } from '@/components/typing-text';
import { motion } from 'framer-motion';
import { FeedbackFab } from '@/components/feedback-fab';

export default function Home() {
  // ✅ Base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002";

  // ✅ Example slugs
  const exampleSlug1 = "learn-ai-skills-in-15-minutes-a-day";
  const exampleSlug2 = "pre-order-yoga-mats-made-entirely-from-ocean-plastic";
  const exampleSlug3 = "local-coffee-subscription";

  // ✅ Example URLs
  const publicUrl1 = `${baseUrl}/p/${exampleSlug1}`;
  const publicUrl2 = `${baseUrl}/p/${exampleSlug2}`;
  const publicUrl3 = `${baseUrl}/p/${exampleSlug3}`;

  const slug = "feedback-from-home-page";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-md md:max-w-2xl text-center space-y-8">

        {/* Branding */}
        <div className="flex justify-center items-center flex-col">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium shadow-sm">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
            <span>IdeaPilot</span>
            
          </div>
          <p className='text-xs opacity-50'>Beta launch</p>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          Validate Your Startup Idea in 60 Seconds
        </h1>

        {/* Subheadline */}
        <TypingText />

        {/* How It Works Section - Expanded by default */}
        <motion.div
          layout
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-6 text-left bg-muted/50 p-5 rounded-lg border border-muted shadow-sm space-y-4"
        >
          <p className="text-sm font-medium text-foreground text-center mb-4">
            What we do for you in a minute?
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
        </motion.div>

        {/* CTA Section */}
        <div className="bg-muted/40 p-5 rounded-xl border border-muted shadow-md space-y-4">
          <p className="text-sm text-muted-foreground">
            Free • No signup required • Ready in 60 seconds
          </p>
          <IdeaForm />
        </div>

        {/* Example Links */}
        <div className="text-sm text-muted-foreground">
          <p className="mb-2 font-medium">See what it creates:</p>
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

        

        {/* Footer Trust Line */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          🚀 Early MVP — feedback welcome
        </p>

        {/* feedback */}
        <FeedbackFab slug={slug} />

      </div>
    </main>
  );
}
