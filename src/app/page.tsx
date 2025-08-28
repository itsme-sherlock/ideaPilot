'use client';

import { useState } from 'react';
import { Lightbulb, TestTube, Users, TrendingUp } from 'lucide-react';

export default function Home() {
  // ✅ Base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002";

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
        <div className="flex justify-center items-center flex-col">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium shadow-sm">
            <TestTube className="h-5 w-5" aria-hidden="true" />
            <span>IdeaPilot</span>
          </div>
          <p className='text-xs opacity-50'>Beta launch</p>
        </div>

        {/* Headline - Focus on confidence/decision making */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
          Get Real Data on Your Startup Idea in 60 Seconds
        </h1>

        {/* Subheadline - More specific to MVP */}
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Turn any idea into a live validation page. See who actually wants it before you build anything.
        </p>

        {/* Value Props - Aligned with core value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/30 p-4 rounded-lg">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-medium">Real Feedback</p>
            <p className="text-muted-foreground text-xs">"Yes, I'd use this!" + emails</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-medium">Instant Data</p>
            <p className="text-muted-foreground text-xs">Live dashboard shows interest</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <TestTube className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="font-medium">Save Time & Money</p>
            <p className="text-muted-foreground text-xs">Decide smart, build later</p>
          </div>
        </div>

        {/* How It Works Section - More empathetic */}
        <div className="mt-6 text-left bg-muted/50 p-5 rounded-lg border border-muted shadow-sm space-y-4">
          <p className="text-sm font-medium text-foreground text-center mb-2">
            We know that feeling...
          </p>
          <p className="text-xs text-muted-foreground text-center mb-4">
            💭 "I have this great idea, but what if nobody wants it? Should I spend months building it first?"
          </p>

          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Just type your idea</h3>
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
              <h3 className="font-semibold text-foreground">AI creates your validation page</h3>
              <p className="text-sm text-muted-foreground">
                Compelling headline + clean page at /p/your-idea that you can share anywhere
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Share and see who cares</h3>
              <p className="text-sm text-muted-foreground">
                Post on Twitter, Reddit, send to friends. People can say "Yes, I'd use this!" and leave their email
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3">
            <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Get real data to decide</h3>
              <p className="text-sm text-muted-foreground">
                Check your admin dashboard: "8 people said yes, 5 emails collected" → Now you know if it's worth building!
              </p>
            </div>
          </div>

          {/* What you get - More specific to MVP */}
          <div className="bg-background rounded p-3 border-l-2 border-primary/30 mt-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">You get confidence:</span> A live page with email signups, yes/no feedback, 
              admin dashboard to track interest, and most importantly - real data to make your next decision.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-muted/40 p-5 rounded-xl border border-muted shadow-md space-y-4">
          <p className="text-sm text-muted-foreground">
            Free • No signup required • Validation ready in 60 seconds
          </p>
          
          {/* Placeholder for IdeaForm component */}
          <div className="bg-white p-4 rounded-lg border space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Describe your startup idea:</p>
              <input 
                type="text" 
                placeholder="AI-powered meal planning for busy families..."
                className="w-full p-3 border rounded-lg text-sm"
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Your email (to send you the validation link):</p>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="w-full p-3 border rounded-lg text-sm"
              />
            </div>
            
            <button className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Create My Validation Test
            </button>
            
            <p className="text-xs text-muted-foreground text-center">
              We'll email you the link to your validation page + results dashboard
            </p>
          </div>
        </div>

        {/* Example Links - Validation focused */}
        <div className="text-sm text-muted-foreground">
          <p className="mb-2 font-medium">See example test pages:</p>
          <ul className="list-none space-y-2">
            <li>
              <a href={publicUrl1} className="text-primary hover:text-primary-dark transition-colors">
                Testing: AI Tutoring for Homeschool Parents →
              </a>
            </li>
            <li>
              <a href={publicUrl2} className="text-primary hover:text-primary-dark transition-colors">
                Testing: Sustainable Workout Gear →
              </a>
            </li>
            <li>
              <a href={publicUrl3} className="text-primary hover:text-primary-dark transition-colors">
                Testing: Neighborhood Coffee Delivery →
              </a>
            </li>
          </ul>
          <p className="text-xs mt-2 opacity-75">
            ↑ These are validation pages, not real products
          </p>
        </div>

        {/* Social Proof / Trust */}
        <div className="bg-muted/20 p-4 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <span className="font-medium">Smart entrepreneurs validate first:</span> Test market demand before investing time and money building something nobody wants.
          </p>
        </div>

        {/* Footer Trust Line */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          🚀 Early MVP — your feedback shapes the product
        </p>

      </div>
    </main>
  );
}