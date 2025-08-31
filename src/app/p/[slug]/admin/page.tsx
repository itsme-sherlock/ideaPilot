"use client";

import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link, MessageSquare, Users, Lightbulb, ChevronDown, ChevronUp, TrendingUp, Clock, Target, AlertCircle, CheckCircle, Zap, Info, AlertTriangle, ThumbsUp, ThumbsDown, Eye, Mail, Bookmark, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@supabase/supabase-js";
import { format, isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import { BookmarkButton } from "@/components/bookmark-button";
import { FeedbackFab } from "@/components/feedback-fab";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Footer } from "@/components/footer";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Types ---
type PageData = {
  id: string;
  headline: string;
  creator_email: string;
  idea: string;
};

type Signup = {
  id: string;
  email: string;
  created_at: string;
};

type Feedback = {
  id: string;
  response: "yes" | "no";
  comment: string | null;
  created_at: string;
};

// --- Supabase Client ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Data Fetcher ---
async function getAdminData(slug: string): Promise<{
  page: PageData;
  signups: Signup[];
  feedback: Feedback[];
} | null> {
  try {
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, headline, idea, creator_email")
      .eq("slug", slug)
      .single();

    if (pageError || !page) {
      console.error("Page fetch error:", pageError);
      return null;
    }

    const { data: signups, error: signupsError } = await supabase
      .from("signups")
      .select("id, email, created_at")
      .eq("page_id", page.id)
      .order("created_at", { ascending: false });

    if (signupsError) console.error("Signups fetch error:", signupsError);

    const { data: feedback, error: feedbackError } = await supabase
      .from("feedback")
      .select("id, response, comment, created_at")
      .eq("page_id", page.id)
      .order("created_at", { ascending: false });

    if (feedbackError) console.error("Feedback fetch error:", feedbackError);

    return {
      page,
      signups: signups || [],
      feedback: feedback || [],
    };
  } catch (error) {
    console.error("Data fetch error:", error);
    return null;
  }
}

// --- Analytics Helper Functions ---
function getRecentActivity(items: (Signup | Feedback)[], hours: number = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return items.filter(item => new Date(item.created_at) > cutoff);
}

function getTimeSinceActivity(items: (Signup | Feedback)[]) {
  if (items.length === 0) return null;
  const latest = new Date(items[0].created_at);
  const now = new Date();
  const diffHours = (now.getTime() - latest.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1) return "Active now";
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return "Yesterday";
  return `${Math.floor(diffHours / 24)} days ago`;
}

function getValidationStatus(signups: Signup[], feedback: Feedback[]) {
  const yesCount = feedback.filter(f => f.response === "yes").length;
  const totalFeedback = feedback.length;
  const signupCount = signups.length;

  if (totalFeedback === 0 && signupCount === 0) {
    return { status: "waiting", message: "Ready to validate", color: "muted" };
  }

  if (totalFeedback < 5) {
    return { status: "collecting", message: "Collecting feedback", color: "orange" };
  }

  const interestRate = (yesCount / totalFeedback) * 100;

  if (interestRate >= 70 && signupCount >= 10) {
    return { status: "strong", message: "Strong validation", color: "green" };
  } else if (interestRate >= 50 && signupCount >= 5) {
    return { status: "moderate", message: "Moderate interest", color: "yellow" };
  } else {
    return { status: "weak", message: "Needs iteration", color: "red" };
  }
}

function extractFeedbackThemes(feedback: Feedback[]) {
  const noResponses = feedback.filter(f => f.response === "no" && f.comment);

  if (noResponses.length === 0) return [];

  // Extract common concern words/phrases from negative feedback
  const commonConcerns: { [key: string]: number } = {};
  const concernKeywords = [
    'expensive', 'price', 'cost', 'money', 'budget',
    'complicated', 'complex', 'confusing', 'difficult',
    'unnecessary', 'dont need', 'already', 'exists',
    'time', 'busy', 'slow', 'effort',
    'trust', 'security', 'privacy', 'safe',
    'feature', 'missing', 'need', 'want',
    'market', 'audience', 'niche', 'target'
  ];

  noResponses.forEach(f => {
    if (f.comment) {
      const comment = f.comment.toLowerCase();
      concernKeywords.forEach(keyword => {
        if (comment.includes(keyword)) {
          const category = getConcernCategory(keyword);
          commonConcerns[category] = (commonConcerns[category] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(commonConcerns)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([theme, count]) => ({ theme, count }));
}

function getConcernCategory(keyword: string): string {
  if (['expensive', 'price', 'cost', 'money', 'budget'].includes(keyword)) return 'Pricing concerns';
  if (['complicated', 'complex', 'confusing', 'difficult'].includes(keyword)) return 'Complexity issues';
  if (['unnecessary', 'dont need', 'already', 'exists'].includes(keyword)) return 'Market need doubts';
  if (['time', 'busy', 'slow', 'effort'].includes(keyword)) return 'Time/effort concerns';
  if (['trust', 'security', 'privacy', 'safe'].includes(keyword)) return 'Trust/security';
  if (['feature', 'missing', 'need', 'want'].includes(keyword)) return 'Feature gaps';
  return 'Other concerns';
}

// --- Format Time Ago ---
function timeAgo(date: string) {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

function getTimeIndicator(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1) return "🔥 Just now";
  if (diffHours < 24) return `🔥 ${Math.floor(diffHours)}h ago`;
  if (isToday(d)) return "🔥 Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

// --- Simplified Validation Insight Component ---
function ValidationInsight({ signups, feedback }: { signups: Signup[], feedback: Feedback[] }) {
  const validation = getValidationStatus(signups, feedback);
  const recentSignups = getRecentActivity(signups, 24);
  const recentFeedback = getRecentActivity(feedback, 24);

  const getInsightMessage = () => {
    if (validation.status === "waiting") {
      return "Share your link to start collecting validation data! 🚀";
    }
    if (validation.status === "collecting") {
      return "Getting initial feedback - keep sharing to collect more data.";
    }
    if (validation.status === "strong") {
      return "🎉 Strong validation! Your idea is resonating with potential customers.";
    }
    if (validation.status === "moderate") {
      return "Mixed signals. Review feedback themes and consider iterating your pitch.";
    }
    return "Time to pivot or refine your approach based on the feedback.";
  };

  const getActionableNext = () => {
    if (validation.status === "waiting") {
      return "Post on Reddit, Twitter, or send to potential customers.";
    }
    if (validation.status === "collecting") {
      return "Keep sharing to gather more feedback.";
    }
    if (validation.status === "strong") {
      return "Start building! Email your signups with a timeline.";
    }
    if (validation.status === "moderate") {
      return "Analyze 'No' feedback and test a refined pitch.";
    }
    return "Review negative feedback patterns and consider major changes.";
  };

  return (
    <Card className={`border-l-4 ${validation.status === "strong" ? "border-l-green-500 bg-green-50/50" :
        validation.status === "moderate" ? "border-l-yellow-500 bg-yellow-50/50" :
          validation.status === "weak" ? "border-l-red-500 bg-red-50/50" :
            "border-l-blue-500 bg-blue-50/50"
      }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {validation.status === "strong" ? <CheckCircle className="h-5 w-5 text-green-600" /> :
              validation.status === "moderate" ? <AlertCircle className="h-5 w-5 text-yellow-600" /> :
                validation.status === "weak" ? <AlertTriangle className="h-5 w-5 text-red-600" /> :
                  <Target className="h-5 w-5 text-blue-600" />}
            {validation.message}
          </CardTitle>
          {(recentSignups.length > 0 || recentFeedback.length > 0) && (
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              {recentSignups.length + recentFeedback.length} recent
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground mb-3">{getInsightMessage()}</p>
        <div className="flex items-start gap-2">
          <div className="h-1 w-1 rounded-full bg-primary mt-2 flex-shrink-0"></div>
          <p className="text-sm text-muted-foreground">
            <strong>Next:</strong> {getActionableNext()}
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Curious how we determine this?{" "}
            <a
              href="mailto:info@GoNo-Go.com"
              className="text-primary hover:underline flex items-center gap-1 inline-flex"
            >
              <Mail className="h-3 w-3" /> Email us
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Enhanced Stats Summary Component with Tooltips ---
function StatsSummary({ signups, feedback }: { signups: Signup[], feedback: Feedback[] }) {
  const yesResponses = feedback.filter(f => f.response === "yes").length;
  const totalResponses = feedback.length;
  const interestRate = totalResponses > 0 ? Math.round((yesResponses / totalResponses) * 100) : 0;
  const recentSignups = getRecentActivity(signups, 24);
  const lastActivity = getTimeSinceActivity([...signups, ...feedback]);

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl text-primary font-bold">{signups.length}</div>
              <p className="text-xs text-muted-foreground">Email signups</p>
            </div>
            {recentSignups.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{recentSignups.length} recent
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl text-primary font-bold">{totalResponses}</div>
          <p className="text-xs text-muted-foreground">Total feedback</p>
          {lastActivity && (
            <p className="text-xs text-muted-foreground mt-1">Last: {lastActivity}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl text-primary font-bold">{interestRate}%</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">
                    <strong>Interest Rate:</strong> The percentage of people who said "Yes" to your idea out of all feedback responses.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">Interest rate</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl text-primary font-bold">
              {totalResponses > 0 ? Math.round((signups.length / totalResponses) * 100) : "--"}%
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">
                    <strong>Conversion Rate:</strong> The percentage of people who signed up with their email out of all feedback responses.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">Conversion rate</p>
          <p className="text-xs text-muted-foreground mt-1">Feedback → Signup</p>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Expandable Comment Component ---
function ExpandableComment({ comment }: { comment: string | null }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!comment) {
    return <span className="text-muted-foreground italic">No comment</span>;
  }

  const needsExpansion = comment.length > 100;

  if (!needsExpansion) {
    return (
      <div className="text-sm leading-relaxed text-foreground">
        {comment}
      </div>
    );
  }

  return (
    <div className="text-sm leading-relaxed text-foreground">
      <div className={isExpanded ? "" : "line-clamp-2"}>
        {comment}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3 mr-1" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3 mr-1" />
            Show more
          </>
        )}
      </Button>
    </div>
  );
}

// --- Expandable Feedback Themes Component ---
function ExpandableFeedbackThemes({ feedback }: { feedback: Feedback[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const noResponses = feedback.filter(f => f.response === "no");
  const themes = extractFeedbackThemes(feedback);

  if (noResponses.length === 0) return null;

  return (
    <div className="mt-4 border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
      >
        <span className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Common Concerns ({noResponses.length} negative responses)
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="p-3 bg-red-50 border-t">
          {themes.length > 0 ? (
            <>
              <h4 className="text-xs font-semibold text-red-800 mb-2">Top Themes:</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {themes.map(({ theme, count }) => (
                  <Badge key={theme} variant="secondary" className="text-xs text-red-700 bg-red-100">
                    {theme} ({count})
                  </Badge>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-red-700">Review individual comments below for patterns.</p>
          )}
          <p className="text-xs text-red-600 mt-2">
            💡 This feedback is gold! Use it to guide your next iteration.
          </p>
        </div>
      )}
    </div>
  );
}

// --- Smart Next Steps Component ---
function SmartNextSteps({ signups, feedback }: { signups: Signup[], feedback: Feedback[] }) {
  const validation = getValidationStatus(signups, feedback);

  const getSteps = () => {
    if (validation.status === "waiting") {
      return [
        { icon: "🚀", text: "Share your link on Reddit r/SideProject or Twitter", priority: "high" },
        { icon: "📧", text: "Send to 10 people in your network who'd use this", priority: "high" },
        { icon: "💬", text: "Join relevant Discord/Slack communities", priority: "medium" },
        { icon: "📱", text: "Check back in 24-48 hours for initial data", priority: "low" }
      ];
    }

    if (validation.status === "collecting") {
      return [
        { icon: "📈", text: "Keep sharing to gather more feedback", priority: "high" },
        { icon: "🎯", text: "Try different audiences (Reddit vs Twitter vs email)", priority: "medium" },
        { icon: "📊", text: "Monitor which channels drive the most engagement", priority: "low" }
      ];
    }

    if (validation.status === "strong") {
      return [
        { icon: "🏗️", text: "Start building! This idea has validated demand", priority: "high" },
        { icon: "📧", text: `Email your ${signups.length} signups with a timeline`, priority: "high" },
        { icon: "📝", text: "Document what resonated most in positive feedback", priority: "medium" },
        { icon: "🔄", text: "Set up a simple landing page for your actual product", priority: "low" }
      ];
    }

    if (validation.status === "moderate") {
      return [
        { icon: "🔍", text: "Analyze negative feedback for iteration opportunities", priority: "high" },
        { icon: "📝", text: "Test a refined pitch with the feedback themes addressed", priority: "high" },
        { icon: "👥", text: "Interview some 'No' respondents to understand their concerns", priority: "medium" },
        { icon: "🎯", text: "Consider targeting a more specific audience", priority: "low" }
      ];
    }

    // weak validation
    return [
      { icon: "🤔", text: "Seriously consider pivoting - this approach isn't working", priority: "high" },
      { icon: "📊", text: "Analyze all negative feedback for patterns", priority: "high" },
      { icon: "💡", text: "Brainstorm how to address the main objections", priority: "medium" },
      { icon: "🔄", text: "Test a completely different angle or target market", priority: "medium" }
    ];
  };

  const steps = getSteps();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Smart Next Steps
        </CardTitle>
        <CardDescription>
          Based on your current validation data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm">
          {steps.map((step, index) => (
            <li key={index} className={`flex items-start gap-3 ${step.priority === "high" ? "text-foreground" :
                step.priority === "medium" ? "text-muted-foreground" :
                  "text-muted-foreground/70"
              }`}>
              <span className="text-base">{step.icon}</span>
              <div className="flex-1">
                <span className={step.priority === "high" ? "font-medium" : ""}>{step.text}</span>
                {step.priority === "high" && (
                  <Badge variant="secondary" className="ml-2 text-xs">Priority</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// --- Enhanced Empty States ---
function EmptySignupsState() {
  return (
    <TableRow>
      <TableCell colSpan={2} className="text-center py-12">
        <div className="space-y-3">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <div>
            <p className="font-medium text-foreground">Ready for your first signup! 🎯</p>
            <p className="text-sm text-muted-foreground">
              Share your link above to start collecting interested emails
            </p>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 max-w-sm mx-auto">
            💡 <strong>Pro tip:</strong> Post in communities where your target users hang out
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

function EmptyFeedbackState() {
  return (
    <TableRow>
      <TableCell colSpan={3} className="text-center py-12">
        <div className="space-y-3">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <div>
            <p className="font-medium text-foreground">Get your first validation! 🚀</p>
            <p className="text-sm text-muted-foreground">
              Share your page to discover if people want your idea
            </p>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 max-w-sm mx-auto">
            🎯 <strong>Goal:</strong> Collect feedback to validate your idea
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// --- Main Component ---
export default function AdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [data, setData] = useState<{
    page: PageData;
    signups: Signup[];
    feedback: Feedback[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string>("");

  const handleComingSoon = (featureName: string) => {
    setComingSoonFeature(featureName);
    setShowComingSoon(true);
  };

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);

      const result = await getAdminData(resolvedParams.slug);
      setData(result);
      setLoading(false);
    }

    loadData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return notFound();
  }

  const { page, signups, feedback } = data;

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"}/p/${slug}`;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"}/p/${slug}/admin`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="text-xs font-semibold px-2 py-1">
            Admin
          </Badge>
          <h1 className="text-3xl font-bold">{page.headline}</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Track interest and feedback for your landing page.
        </p>

        {/* Validation Insight - NEW */}
        <ValidationInsight signups={signups} feedback={feedback} />

        {/* Stats Overview */}
        <StatsSummary signups={signups} feedback={feedback} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* PRIMARY ACTION: Share Public Link - Enhanced */}
            <Card className="border-green-400 bg-green-400/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-green-800" />
                  <span className="text-lg ">🚀 Share Your Public Page</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  This is your most important step! Copy and share this link with your audience to collect feedback and signups.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Input
                    value={publicUrl}
                    readOnly
                    className="font-mono text-sm bg-background border-primary/30"
                  />
                  <div className="relative">
                    <CopyButton
                      textToCopy={publicUrl}
                      className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-11"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">
                    💡 Share on Reddit, Twitter, or directly with potential customers
                  </p>
                  {(signups.length > 0 || feedback.length > 0) && (
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {signups.length + feedback.length} responses
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SECONDARY ACTION: Admin Dashboard - With Warning */}
            <Card className="border-red-500 bg-red-50/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  🔐 Save Private Admin Link
                  <Badge variant="secondary" className="text-xs bg-red-200/50">
                    Keep Private
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      This link gives access to your admin dashboard. Save it safely!
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <ShieldAlert className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">This is not public link hence Never share this with anyone.</span>
                    </div>
                  </div>
                </p>

                <div className="flex items-center gap-2">
                  <Input
                    value={adminUrl}
                    type="password"
                    readOnly
                    className="font-mono text-xs bg-muted/50 border-muted flex-1"
                  />
                  <CopyButton
                    textToCopy={adminUrl}
                    className="h-8 px-3 text-xs hover:bg-muted/50"
                  />
                  <BookmarkButton className="hover:bg-muted/50 h-8 w-8 p-0">
                    <Bookmark className="h-3 w-3" />
                  </BookmarkButton>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Bookmark this page or save the link somewhere safe. Losing it may loose your valuble feedback insights.
                </p>
              </CardContent>
            </Card>


            {/* Tabbed Content */}
            <Card>
              <Tabs defaultValue="feedback" className="w-full">
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="feedback" className="flex items-center gap-2 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      Feedback ({feedback.length})
                    </TabsTrigger>
                    <TabsTrigger value="signups" className="flex items-center gap-2 text-xs">
                      <Users className="h-3 w-3" />
                      Signups ({signups.length})
                    </TabsTrigger>
                    <TabsTrigger value="idea" className="flex items-center gap-2 text-xs">
                      <Lightbulb className="h-3 w-3" />
                      Original Idea
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  <TabsContent value="feedback" className="space-y-4">
                    <div>
                      <CardDescription>
                        What potential customers think about your idea.
                      </CardDescription>
                    </div>

                    <ExpandableFeedbackThemes feedback={feedback} />

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Response</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedback.length === 0 ? (
                          <EmptyFeedbackState />
                        ) : (
                          feedback.map((f) => (
                            <TableRow key={f.id}>
                              <TableCell>
                                <Badge
                                  variant={f.response === "yes" ? "success" : "destructive"}
                                  className="text-xs"
                                >
                                  {f.response === "yes" ? "Yes, I'd use it" : "No, not for me"}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-md">
                                <ExpandableComment comment={f.comment} />
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                <div className="text-right">
                                  <div>{getTimeIndicator(f.created_at)}</div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="signups" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <CardDescription>
                        People interested in your idea.
                      </CardDescription>
                      {signups.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:bg-muted/50"
                          onClick={() => handleComingSoon("CSV Export")}
                        >
                          📊 Export CSV
                        </Button>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {signups.length === 0 ? (
                          <EmptySignupsState />
                        ) : (
                          signups.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium">{s.email}</TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                <div className="text-right">
                                  <div>{getTimeIndicator(s.created_at)}</div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="idea" className="space-y-4">
                    <CardDescription>
                      This is what you started with. Compare it to feedback above.
                    </CardDescription>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm leading-relaxed text-foreground">{page.idea}</p>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <SmartNextSteps signups={signups} feedback={feedback} />

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:bg-muted/50"
                    size="sm"
                    onClick={() => handleComingSoon("Export All Data")}
                  >
                    📊 Export All Data
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:bg-muted/50"
                    size="sm"
                    onClick={() => handleComingSoon("Landing Page Editor")}
                  >
                    ✏️ Edit Landing Page
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:bg-muted/50"
                    size="sm"
                    onClick={() => handleComingSoon("Email Campaign Tool")}
                  >
                    📧 Email Subscribers
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <FeedbackFab slug={slug} />

        {/* Coming Soon Modal */}
        <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                🚀 {comingSoonFeature}
              </DialogTitle>
              <DialogDescription asChild className="text-left space-y-3">
                <div>
                  <p>This feature is coming soon! We're working hard to bring you:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {comingSoonFeature === "CSV Export" && (
                      <>
                        <li>Export email lists as CSV files</li>
                        <li>Filter by date ranges</li>
                        <li>Include feedback data</li>
                      </>
                    )}
                    {comingSoonFeature === "Export All Data" && (
                      <>
                        <li>Complete data export (emails + feedback)</li>
                        <li>Multiple formats (CSV, JSON, PDF)</li>
                        <li>Analytics summaries</li>
                      </>
                    )}
                    {comingSoonFeature === "Landing Page Editor" && (
                      <>
                        <li>Visual page editor</li>
                        <li>Custom themes and colors</li>
                        <li>A/B testing capabilities</li>
                      </>
                    )}
                    {comingSoonFeature === "Email Campaign Tool" && (
                      <>
                        <li>Email template builder</li>
                        <li>Automated follow-ups</li>
                        <li>Campaign analytics</li>
                      </>
                    )}
                  </ul>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      💡 Want to be notified when it's ready? Drop us a line at{" "}
                      <span className="font-medium text-foreground">info@GoNo-Go.com</span>
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowComingSoon(false)}
              >
                Got it!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Footer needed={true} />
    </div>
  );
}