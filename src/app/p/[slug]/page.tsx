'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Mail, MessageCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';

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

// Simplified Error Component
const ErrorDisplay = ({ errorType, onRetry }: { errorType: ErrorType; onRetry: () => void }) => {
  const isNotFound = errorType === 'not-found';

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="text-6xl mb-4">😕</div>
      <h1 className="text-2xl font-bold mb-3">
        {isNotFound ? 'Page Not Found' : 'Something Went Wrong'}
      </h1>
      <p className="text-muted-foreground mb-8">
        {isNotFound ? 'This validation page may have moved or been updated.' : 'Please try again in a moment.'}
      </p>

      <div className="space-y-4">
        <button
          onClick={onRetry}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          {isNotFound ? 'Check URL' : 'Try Again'}
        </button>
        {isNotFound && (
          <div>
            <a href="/" className="text-primary hover:underline text-sm">
              ← Create your own validation page
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading State
const LoadingDisplay = () => (
  <div className="container mx-auto max-w-4xl px-4 py-16">
    <div className="text-center animate-pulse space-y-8">
      <div className="h-12 bg-muted rounded-lg w-3/4 mx-auto" />
      <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto" />
      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-8 h-48" />
        <div className="bg-card border rounded-lg p-8 h-32" />
      </div>
    </div>
  </div>
);

// Smart Social Proof - More compelling with validation focus
const SocialProof = ({ signupCount }: { signupCount?: number }) => {
  if (signupCount && signupCount > 0) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium border border-green-200">
          <CheckCircle className="w-4 h-4" />
          {signupCount}+ people want this built
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 text-sm mb-8">
      <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-200">
        <AlertCircle className="w-4 h-4" />
        Idea validation in progress
      </span>
    </div>
  );
};

// Enhanced Signup Form Component with better explanation
const SignupForm = ({ pageId }: { pageId: string }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('signups')
        .insert([{ page_id: pageId, email: email.trim() }]);

      if (!error) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-6 space-y-3">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
        <p className="font-medium text-green-800">Your vote has been counted!</p>
        <p className="text-sm text-muted-foreground">
          You'll be first to know if this gets built based on demand.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
        <p className="text-sm text-foreground font-medium mb-2">How Your Email Helps:</p>
        <ul className="text-xs text-muted-foreground space-y-1 text-left">
          <li>• Shows the creator there's real demand for this idea</li>
          <li>• Your signup counts as a strong "YES, build this!" vote</li>
          <li>• Helps the entrepreneur make a confident GO decision</li>
          <li>• You get early access if it gets developed</li>
        </ul>
      </div>
      
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 px-4 py-3 border border-muted-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSubmitting}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !email.trim()}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Adding...' : 'Yes, Build This!'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        We'll only contact you if this idea moves forward to development
      </p>
    </div>
  );
};

// Enhanced Feedback Widget with better explanation
const FeedbackWidget = ({ pageId }: { pageId: string }) => {
  const [selectedFeedback, setSelectedFeedback] = useState<'yes' | 'no' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFeedbackClick = (feedback: 'yes' | 'no') => {
    // Just set the selection, don't submit yet
    setSelectedFeedback(feedback);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedFeedback) return;

    setIsSubmitting(true);

    try {
      if (!pageId) {
        console.error('No pageId provided for feedback');
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          page_id: pageId,
          response: selectedFeedback,
          comment: comment.trim() || null
        }])
        .select();

      if (error) {
        console.error('Feedback submission error details:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        setIsSubmitting(false);
        alert('Failed to submit feedback. Please try again.');
        return;
      }

      console.log('Feedback submitted successfully:', data);
      setIsSubmitted(true);

    } catch (networkError) {
      console.error('Network/unexpected error:', networkError);
      setIsSubmitting(false);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const handleQuickSubmit = async (feedback: 'yes' | 'no') => {
    // For users who don't want to add comments, submit immediately
    setSelectedFeedback(feedback);
    setIsSubmitting(true);

    try {
      if (!pageId) {
        console.error('No pageId provided for feedback');
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          page_id: pageId,
          response: feedback,
          comment: null
        }])
        .select();

      if (error) {
        console.error('Feedback submission error details:', error);
        setIsSubmitting(false);
        alert('Failed to submit feedback. Please try again.');
        return;
      }

      console.log('Quick feedback submitted successfully:', data);
      setIsSubmitted(true);

    } catch (networkError) {
      console.error('Network/unexpected error:', networkError);
      setIsSubmitting(false);
      alert('Network error. Please check your connection and try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-4 space-y-2">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
        <p className="font-medium">Thanks for helping validate this idea!</p>
        <p className="text-sm text-muted-foreground">
          Your feedback helps the creator make smart development decisions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 border border-border rounded-lg p-3 mb-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Your honest opinion matters:</strong> The creator will use this feedback to decide whether to invest time developing this idea or focus on concepts with stronger market appeal.
        </p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => handleFeedbackClick('yes')}
          disabled={isSubmitting}
          className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-colors ${selectedFeedback === 'yes'
              ? 'border-green-500 bg-green-100 text-green-800'
              : 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <CheckCircle className="w-5 h-5" />
          Yes, I'd use this
        </button>
        <button
          onClick={() => handleFeedbackClick('no')}
          disabled={isSubmitting}
          className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-colors ${selectedFeedback === 'no'
              ? 'border-red-500 bg-red-100 text-red-800'
              : 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <XCircle className="w-5 h-5" />
          Not for me
        </button>
      </div>

      {selectedFeedback && !isSubmitted && (
        <div className="space-y-3 border-t pt-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={selectedFeedback === 'yes' ?
              "What excites you about this? (optional)" :
              "What would make this more appealing? (optional)"
            }
            rows={3}
            className="w-full px-3 py-2 border border-muted-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting}
              className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isSubmitting ? 'Submitting...' : comment.trim() ? 'Submit with Comment' : 'Submit'}
            </button>

            <button
              onClick={() => handleQuickSubmit(selectedFeedback)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-muted-foreground/20 rounded-lg hover:bg-muted/50 transition-colors"
            >
              Skip comment
            </button>
          </div>
        </div>
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

  const fetchData = async () => {
    setLoading(true);
    setErrorType(null);

    try {
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('id, headline, sub_headline, idea')
        .eq('slug', slug)
        .single();

      if (pageError) {
        setErrorType(pageError.code === 'PGRST116' ? 'not-found' : 'server');
        setLoading(false);
        return;
      }

      if (!page) {
        setErrorType('not-found');
        setLoading(false);
        return;
      }

      const { count } = await supabase
        .from('signups')
        .select('*', { count: 'exact', head: true })
        .eq('page_id', page.id);

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

  if (loading) return <LoadingDisplay />;
  if (errorType) return <ErrorDisplay errorType={errorType} onRetry={fetchData} />;
  if (!pageData) return <ErrorDisplay errorType="server" onRetry={fetchData} />;

  const { headline, sub_headline, id, signupCount } = pageData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10">
      <div className="container mx-auto max-w-4xl px-4 py-16">

        {/* Hero Section - Clear validation messaging */}
        <header className="text-center mb-16">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium border border-border">
              🧪 Idea Validation in Progress
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {headline}
          </h1>

          {sub_headline && (
            <div className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              <div className="prose prose-sm prose-primary">
                <ReactMarkdown>{sub_headline}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-sm text-foreground font-medium mb-2">
              This could be your next favorite product — we're testing demand first.
            </p>
            <p className="text-xs text-muted-foreground">
              The creator is gathering market signals before development begins. Your response will directly influence whether this becomes reality.
            </p>
          </div>

          <SocialProof signupCount={signupCount} />
        </header>

        {/* Explanation Section - Why their participation matters */}
        <div className="mb-12 max-w-3xl mx-auto">
          <Card className="bg-muted/30 border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
                🎯 Why Your Response Matters
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Right now, this is a promising idea ready for development. The creator wants to build something people actually want.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="font-medium text-foreground">Your "YES" vote</div>
                    <div className="text-xs">Real market validation</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">Your email signup</div>
                    <div className="text-xs">Proof of genuine interest</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">Your feedback</div>
                    <div className="text-xs">Direction for enhancement</div>
                  </div>
                </div>
                <p className="text-center font-medium mt-4 text-foreground">
                  You're not just giving feedback — you're helping an entrepreneur make a smart, data-driven decision.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main CTAs - Enhanced with clearer purpose */}
        <main className="space-y-8 mb-16">

          {/* Primary CTA: Email Signup - Clear value */}
          <Card className="shadow-lg border-2 border-primary/10">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">Want This Built? Vote with Your Email</CardTitle>
              </div>
              <p className="text-muted-foreground">
                Email signups = real demand signals. Show the creator this solves a problem for you.
              </p>
            </CardHeader>
            <CardContent>
              <SignupForm pageId={id} />
            </CardContent>
          </Card>

          {/* Secondary CTA: Quick Feedback with explanation */}
          <Card className="shadow-md">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl">Quick Market Feedback</CardTitle>
              </div>
              <p className="text-muted-foreground text-sm">
                Help the creator understand market appeal — your honest opinion guides smart decisions
              </p>
            </CardHeader>
            <CardContent>
              <FeedbackWidget pageId={id} />
            </CardContent>
          </Card>
        </main>

        {/* How This Works - Educational section */}
        <div className="mb-12">
          <Card className="bg-muted/30 border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">How This Validation Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="text-center space-y-2">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto">1</div>
                  <div className="font-medium text-foreground">You see the idea</div>
                  <div className="text-xs text-muted-foreground">Decide if you'd actually use it</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto">2</div>
                  <div className="font-medium text-foreground">Vote with your email</div>
                  <div className="text-xs text-muted-foreground">Show real interest (not just browsing)</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto">3</div>
                  <div className="font-medium text-foreground">Creator gets data</div>
                  <div className="text-xs text-muted-foreground">"15 signups = there's demand!"</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto">4</div>
                  <div className="font-medium text-foreground">Smart GO decision</div>
                  <div className="text-xs text-muted-foreground">Creator will build it with confidence</div>
                </div>
              </div>
              <div className="text-center mt-6 p-3 bg-background rounded border-l-4 border-primary">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Your email signup is a STRONG signal</span> that this solves a real problem for you.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation CTA - Clear business model */}
        <aside className="text-center mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-6">
              <p className="text-muted-foreground mb-3">
                <strong className="text-foreground">Got your own idea to validate?</strong>
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Create Your Validation Page in 60 Seconds →
              </a>
            </CardContent>
          </Card>
        </aside>

        {/* Clean Footer with clear explanation */}
        <footer className="border-t pt-8 text-center space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">
              Help an entrepreneur make a smart decision!
            </p>
            <p>
              If enough people show interest, the creator will confidently move forward with development. Your participation helps turn great ideas into great products.
            </p>
            <p className="text-xs mt-4">
              Powered by{' '}
              <a href="/" className="text-primary hover:underline font-medium">
                GoNo-Go
              </a>
              {' '}— Turn any idea into a validation page in 60 seconds
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}