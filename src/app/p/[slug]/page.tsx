'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { SignupForm } from '@/components/signup-form';
import { FeedbackWidget } from '@/components/feedback-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@supabase/supabase-js';

// --- Types ---
type PageData = {
  id: string;
  headline: string;
  sub_headline: string | null;
  idea: string;
  signupCount?: number;
};

type ErrorType = 'not-found' | 'network' | 'server' | null;

// --- Supabase Client ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🎯 UX TEACHING MOMENT #1: Error Message Component
// Instead of generic errors, we create specific, actionable messages
// This helps users understand what went wrong and how to fix it
const ErrorDisplay = ({ errorType, onRetry }: { errorType: ErrorType; onRetry: () => void }) => {
  const errorContent = {
    'not-found': {
      title: 'Idea Not Found',
      message: 'This validation page doesn\'t exist. The link might be incorrect or the idea may have been removed.',
      action: 'Check the URL'
    },
    'network': {
      title: 'Connection Problem',
      message: 'Unable to load this page. Please check your internet connection.',
      action: 'Try Again'
    },
    'server': {
      title: 'Server Error',
      message: 'Something went wrong on our end. Our team has been notified.',
      action: 'Retry'
    }
  };

  const content = errorContent[errorType!] || errorContent['server'];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mb-6">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold mb-3">{content.title}</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          {content.message}
        </p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={onRetry}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          {content.action}
        </button>
        
        {errorType === 'not-found' && (
          <div className="pt-4">
            <a 
              href="/" 
              className="text-primary hover:underline text-sm"
            >
              ← Back to Homepage
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// 🎯 UX TEACHING MOMENT #2: Contextual Loading Component
// Good loading states tell users what's happening and set expectations
// This reduces perceived wait time and abandonment
const LoadingDisplay = () => (
  <div className="container mx-auto max-w-3xl px-4 py-16">
    <div className="text-center animate-pulse">
      {/* Content skeleton that matches the actual layout */}
      <div className="h-12 bg-muted rounded-lg w-3/4 mx-auto mb-4" />
      <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto mb-8" />
      
      {/* Status message - tells users what's happening */}
      <p className="text-sm text-muted-foreground mb-12 animate-pulse">
        Loading your idea validation page...
      </p>
      
      {/* Card skeletons */}
      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-6">
          <div className="h-6 bg-muted rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted rounded w-2/3 mb-4" />
          <div className="h-10 bg-muted rounded w-full" />
        </div>
        <div className="bg-card border rounded-lg p-6">
          <div className="h-6 bg-muted rounded w-1/4 mb-4" />
          <div className="h-20 bg-muted rounded w-full" />
        </div>
      </div>
    </div>
  </div>
);

// 🎯 UX TEACHING MOMENT #3: Smart Social Proof Component
// Always show social proof space to prevent layout shift
// Provides alternative messaging when no signups yet
const SocialProof = ({ signupCount }: { signupCount?: number }) => {
  // Always render the container to prevent layout shift (CLS - Core Web Vital)
  return (
    <div className="flex items-center justify-center gap-2 text-sm mb-8">
      {signupCount && signupCount > 0 ? (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          {signupCount}+ people have joined
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Be the first to validate this idea
        </span>
      )}
    </div>
  );
};

// Main Component
export default function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<ErrorType>(null);

  // 🎯 UX TEACHING MOMENT #4: Better Error Handling
  // We differentiate between error types to provide specific guidance
  const fetchData = async () => {
    setLoading(true);
    setErrorType(null);

    try {
      // Fetch page data with timeout for better error handling
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('id, headline, sub_headline, idea')
        .eq('slug', slug)
        .single();

      if (pageError) {
        // Differentiate between "not found" and other errors
        if (pageError.code === 'PGRST116') {
          setErrorType('not-found');
        } else {
          setErrorType('server');
        }
        setLoading(false);
        return;
      }

      if (!page) {
        setErrorType('not-found');
        setLoading(false);
        return;
      }

      // Fetch signup count
      const { count, error: countError } = await supabase
        .from('signups')
        .select('*', { count: 'exact', head: true })
        .eq('page_id', page.id);

      // Don't fail the entire page if count fails - graceful degradation
      if (countError) {
        console.warn('Could not fetch signup count:', countError);
      }

      setPageData({ ...page, signupCount: count || 0 });
      setLoading(false);

    } catch (error) {
      console.error('Network error:', error);
      setErrorType('network');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Render loading state
  if (loading) {
    return <LoadingDisplay />;
  }

  // Render error state with retry functionality
  if (errorType) {
    return <ErrorDisplay errorType={errorType} onRetry={fetchData} />;
  }

  // This shouldn't happen, but handle it gracefully
  if (!pageData) {
    return <ErrorDisplay errorType="server" onRetry={fetchData} />;
  }

  const { headline, sub_headline, id, signupCount } = pageData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        
        {/* 🎯 UX TEACHING MOMENT #5: Hero Section with Clear Value Hierarchy */}
        {/* We use visual hierarchy to guide attention: headline → subheadline → social proof → CTA */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            {headline}
          </h1>

          {sub_headline && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {sub_headline}
            </p>
          )}

          <SocialProof signupCount={signupCount} />
        </header>

        {/* 🎯 UX TEACHING MOMENT #6: Progressive Information Disclosure */}
        {/* Main content in a logical flow: value prop → action → secondary action */}
        <main className="space-y-8 mb-16">
          
          {/* Primary CTA: Email Signup - Enhanced with better copy */}
          <Card className="text-left shadow-lg border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-2">
                🚀 Get Exclusive Early Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Join the waitlist and be among the first to try this idea when it launches. 
                  You'll get:
                </p>
                
                {/* 🎯 UX TEACHING MOMENT #7: Specific Benefits List */}
                {/* Instead of vague promises, we list concrete benefits */}
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    48-hour head start before public launch
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    Exclusive beta features and early feedback opportunities  
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    Direct line to the founder for feature requests
                  </li>
                </ul>
                
                {/* Trust indicator */}
                <p className="text-xs text-muted-foreground/80 flex items-center gap-1">
                  🔒 No spam, unsubscribe anytime. We respect your inbox.
                </p>
              </div>
              
              <SignupForm pageId={id} />
            </CardContent>
          </Card>

          {/* Secondary CTA: Feedback - Only show after signup or with clear value */}
          <Card className="text-left">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                💭 Help Shape This Idea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your input drives development. Share what you'd want to see, potential concerns, 
                or how you'd use this solution.
              </p>
              <FeedbackWidget pageId={id} />
            </CardContent>
          </Card>
        </main>

        {/* 🎯 UX TEACHING MOMENT #8: Single, Clear Secondary CTA */}
        {/* Instead of multiple competing CTAs, we have one clear alternative path */}
        <aside className="text-center mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold mb-3">Got Your Own Idea?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Validate your startup idea in 60 seconds. No coding, no setup — 
                just instant feedback from real people.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                🚀 Validate Your Idea Free
              </a>
            </CardContent>
          </Card>
        </aside>

        {/* 🎯 UX TEACHING MOMENT #9: Clean, Organized Footer */}
        {/* All secondary information in one place, doesn't compete with main CTAs */}
        <footer className="border-t pt-8 space-y-6 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </a>
            <a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
            <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="mailto:hello@ideapilot.com" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              This is an early-stage idea validation. Your participation helps build something people actually want.
            </p>
            <p className="text-xs">
              Powered by{' '}
              <a 
                href="https://ideapilot.com" 
                className="font-medium hover:text-foreground transition-colors"
              >
                IdeaPilot
              </a>
              {' '}— Validate ideas in 60 seconds
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}