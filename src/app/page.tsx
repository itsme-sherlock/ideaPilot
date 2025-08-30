'use client';

import { useState } from 'react';
import { Lightbulb, TestTube, Users, TrendingUp } from 'lucide-react';
import { IdeaForm } from '@/components/idea-form';
import { FeedbackFab } from '@/components/feedback-fab';

export default function Home() {
  // ✅ Base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002";

  // ✅ Toggle state for logo
  const [isGo, setIsGo] = useState(true);

  // ✅ Better validation-focused example slugs
  const exampleSlug1 = "test-ai-tutoring-for-homeschool-parents";
  const exampleSlug2 = "validate-sustainable-workout-gear-idea";
  const exampleSlug3 = "test-demand-neighborhood-coffee-delivery";

  // ✅ Example URLs
  const publicUrl1 = `${baseUrl}/p/${exampleSlug1}`;
  const publicUrl2 = `${baseUrl}/p/${exampleSlug2}`;
  const publicUrl3 = `${baseUrl}/p/${exampleSlug3}`;

  const slug = "feedback-from-home-page";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-md md:max-w-2xl text-center space-y-8">

        {/* Branding */}
        <div className="flex justify-center items-center flex-col space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              {/* Simple Interactive Toggle Switch */}
              <button 
                onClick={() => setIsGo(!isGo)}
                className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                aria-label="Toggle between Go and No-Go"
              >
                <div className={`w-14 h-8 rounded-full border-2 transition-all duration-300 relative ${
                  isGo 
                    ? 'bg-primary border-primary' 
                    : 'bg-muted border-muted-foreground/30'
                }`}>
                  <div className={`absolute top-[0.15rem] w-6 h-6 rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${
                    isGo 
                      ? 'translate-x-7 bg-primary-foreground' 
                      : 'translate-x-1 bg-muted-foreground'
                  }`}>
                    <span className={`text-xs font-bold ${
                      isGo ? 'text-primary' : 'text-primary-foreground'
                    }`}>
                      {isGo ? 'GO' : 'NO'}
                    </span>
                  </div>
                </div>
              </button>
              
              {/* Brand Name */}
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  GoNo-Go
                </h2>
                <p className="text-xs text-muted-foreground">
                  Smart Startup Decisions
                </p>
              </div>
            </div>
          </div>
          
          <p className='text-xs text-muted-foreground'>Beta launch</p>
        </div>

        {/* Headline - Focus on go/no-go decision making */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          Make Smart Go/No-Go Decisions on Your Startup Ideas
        </h1>

        {/* Subheadline - More specific to decision making */}
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Get real market validation in 60 seconds. Know if your idea is worth pursuing before you invest time and money.
        </p>

        {/* Value Props - Aligned with go/no-go decisions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/30 p-4 rounded-lg">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-medium">Real Market Signals</p>
            <p className="text-muted-foreground text-xs">Actual interest + email signups</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-medium">Clear Go/No-Go Data</p>
            <p className="text-muted-foreground text-xs">Dashboard shows real demand</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <TestTube className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-medium">Smart Decisions</p>
            <p className="text-muted-foreground text-xs">Validate before you build</p>
          </div>
        </div>

        {/* How It Works Section - Updated for go/no-go framing */}
        <div className="mt-6 text-left bg-muted/50 p-5 rounded-lg border border-muted shadow-md space-y-4">
          <p className="text-sm font-medium text-foreground text-center mb-2">
            Stop guessing. Start knowing.
          </p>
          <p className="text-xs text-muted-foreground text-center mb-4">
            💭 "Should I GO with this idea or is it a NO-GO? I need real data to decide."
          </p>

          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Share your idea</h3>
              <p className="text-sm text-muted-foreground">
                Something like: "AI course for busy parents" or "Local coffee delivery app"
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Get your validation page</h3>
              <p className="text-sm text-muted-foreground">
                AI creates a compelling test page at /p/your-idea that you can share anywhere
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Share and collect signals</h3>
              <p className="text-sm text-muted-foreground">
                Post on social media, send to friends. People can say "Yes, I'd use this!" and leave their email
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3">
            <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Make your go/no-go decision</h3>
              <p className="text-sm text-muted-foreground">
                Dashboard shows: "12 people said yes, 8 emails collected" → Clear GO signal! Or maybe it's a NO-GO. Either way, you know.
              </p>
            </div>
          </div>

          {/* What you get - Updated for decision making */}
          <div className="bg-background rounded p-3 border-l-2 border-primary/30 mt-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Make confident decisions:</span> Get a validation page, track real interest, 
              collect emails from interested users, and most importantly - know whether to GO or NO-GO on your idea.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-5 rounded-xl  space-y-4">
          <p className="text-sm text-muted-foreground">
            Free • No signup required • Go/No-Go decision in 60 seconds
          </p>
          <IdeaForm />
          {/* Placeholder for IdeaForm component */}
         
        </div>

        {/* Social Proof / Trust - Updated messaging */}
        <div className="bg-muted/20 p-4 rounded-lg">
          <p className="text-xs text-muted-foreground">
            🎯 <span className="font-medium text-foreground">Smart founders validate first:</span> Get clear go/no-go signals before investing months building something the market doesn't want.
          </p>
        </div>

        {/* Footer Trust Line */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          🚀 Early MVP — your feedback shapes the product
        </p>

        {/* feedback */}
        <FeedbackFab slug={slug} />

      </div>
    </main>
  );
}