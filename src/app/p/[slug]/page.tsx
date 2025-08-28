'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Mail, MessageCircle } from 'lucide-react';
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
        {isNotFound ? 'This validation page doesn\'t exist or has been removed.' : 'Please try again in a moment.'}
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

// Smart Social Proof - More compelling
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
        Testing demand for this idea
      </span>
    </div>
  );
};

// Enhanced Signup Form Component
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
        <p className="font-medium text-green-800">Added to the list!</p>
        <p className="text-sm text-muted-foreground">
          You'll be notified if this gets built.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
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
          {isSubmitting ? 'Adding...' : 'Count Me In'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        We'll only contact you if this idea moves forward
      </p>
    </div>
  );
};

// Enhanced Feedback Widget - Fixed flow
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
        <p className="font-medium">Thanks for the feedback!</p>
        <p className="text-sm text-muted-foreground">
          Your input helps validate this idea.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => handleFeedbackClick('yes')}
          disabled={isSubmitting}
          className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-colors ${
            selectedFeedback === 'yes' 
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
          className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-colors ${
            selectedFeedback === 'no' 
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
              "What would you change or improve? (optional)"
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

        {/* Hero Section - Clear, focused */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {headline}
          </h1>

          {sub_headline && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {sub_headline}
            </p>
          )}

          <SocialProof signupCount={signupCount} />
        </header>

        {/* Main CTAs - Simplified, focused */}
        <main className="space-y-8 mb-16">

          {/* Primary CTA: Email Signup - Clear value */}
          <Card className="shadow-lg border-2 border-primary/10">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">Want This Built?</CardTitle>
              </div>
              <p className="text-muted-foreground">
                Add your email to show demand. We'll notify you if it gets built.
              </p>
            </CardHeader>
            <CardContent>
              <SignupForm pageId={id} />
            </CardContent>
          </Card>

          {/* Secondary CTA: Quick Feedback */}
          <Card className="shadow-md">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                <CardTitle className="text-xl">Quick Feedback</CardTitle>
              </div>
              <p className="text-muted-foreground text-sm">
                Help validate this idea with one click
              </p>
            </CardHeader>
            <CardContent>
              <FeedbackWidget pageId={id} />
            </CardContent>
          </Card>
        </main>

        {/* Validation CTA - Clear business model */}
        <aside className="text-center mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-6">
              <p className="text-muted-foreground mb-3">
                <strong className="text-foreground">Got your own idea?</strong>
              </p>
              <a 
                href="/" 
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Test Your Idea in 60 Seconds →
              </a>
            </CardContent>
          </Card>
        </aside>

        {/* Clean Footer */}
        <footer className="border-t pt-8 text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              This is an <strong>idea validation test</strong> — not a real product yet.
            </p>
            <p className="text-xs mt-2">
              Powered by{' '}
              <a href="/" className="text-primary hover:underline font-medium">
                IdeaPilot
              </a>
              {' '}— Turn any idea into a validation page in 60 seconds
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}