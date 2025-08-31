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
import { Checkbox } from "@/components/ui/checkbox";
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

// --- Reusable Component: Step Card ---
function StepCard({ 
  stepNumber, 
  title, 
  description, 
  children, 
  checkboxId,
  onCheckboxChange,
  isChecked,
  nudge
}: {
  stepNumber: number;
  title: string;
  description: string;
  children: React.ReactNode;
  checkboxId: string;
  onCheckboxChange: (checked: boolean) => void;
  isChecked: boolean;
  nudge?: string;
}) {
  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
            {stepNumber}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={checkboxId}
                  checked={isChecked}
                  onCheckedChange={onCheckboxChange}
                />
                <label 
                  htmlFor={checkboxId} 
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Mark as done
                </label>
              </div>
            </div>
            <CardDescription className="text-sm">
              {description}
            </CardDescription>
            {nudge && (
              <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                💡 {nudge}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

// --- Reusable Component: Metric Card ---
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  tooltip 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="text-2xl text-primary font-bold">{value}</div>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
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

  if (totalFeedback < 3) {
    return { status: "collecting", message: "Collecting initial feedback", color: "orange" };
  }

  const interestRate = (yesCount / totalFeedback) * 100;

  if (interestRate >= 70 && signupCount >= Math.max(3, Math.floor(totalFeedback * 0.3))) {
    return { status: "strong", message: "Strong validation", color: "green" };
  } else if (interestRate >= 50 && signupCount >= Math.max(2, Math.floor(totalFeedback * 0.2))) {
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

// --- Reusable Component: Quick Stats Row ---
function QuickStatsRow({ signups, feedback }: { signups: Signup[], feedback: Feedback[] }) {
  const yesResponses = feedback.filter(f => f.response === "yes").length;
  const totalResponses = feedback.length;
  const interestRate = totalResponses > 0 ? Math.round((yesResponses / totalResponses) * 100) : 0;
  const recentSignups = getRecentActivity(signups, 24);
  const lastActivity = getTimeSinceActivity([...signups, ...feedback]);

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <MetricCard
        title="Email signups"
        value={signups.length}
        subtitle={recentSignups.length > 0 ? `+${recentSignups.length} recent` : undefined}
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Total feedback"
        value={totalResponses}
        subtitle={lastActivity ? `Last: ${lastActivity}` : undefined}
        icon={<MessageSquare className="h-4 w-4" />}
      />
      <MetricCard
        title="Interest rate"
        value={`${interestRate}%`}
        icon={<TrendingUp className="h-4 w-4" />}
        tooltip="The percentage of people who said 'Yes' to your idea out of all feedback responses."
      />
      <MetricCard
        title="Conversion rate"
        value={totalResponses > 0 ? `${Math.round((signups.length / totalResponses) * 100)}%` : "--"}
        subtitle="Feedback → Signup"
        icon={<Target className="h-4 w-4" />}
        tooltip="The percentage of people who signed up with their email out of all feedback responses."
      />
    </div>
  );
}

// --- Reusable Component: Validation Summary ---
function ValidationSummary({ signups, feedback }: { signups: Signup[], feedback: Feedback[] }) {
  const validation = getValidationStatus(signups, feedback);
  const recentSignups = getRecentActivity(signups, 24);
  const recentFeedback = getRecentActivity(feedback, 24);

  if (signups.length === 0 && feedback.length === 0) return null;

  const getInsightMessage = () => {
    if (validation.status === "collecting") {
      return "Getting initial feedback - keep sharing to collect more data.";
    }
    if (validation.status === "strong") {
      return "Strong validation! Your idea is resonating with potential customers.";
    }
    if (validation.status === "moderate") {
      return "Mixed signals. Review feedback themes and consider iterating your pitch.";
    }
    return "Time to pivot or refine your approach based on the feedback.";
  };

  return (
    <Card className={`border-l-4 mb-6 ${
      validation.status === "strong" ? "border-l-green-500 bg-green-50/50" :
      validation.status === "moderate" ? "border-l-yellow-500 bg-yellow-50/50" :
      validation.status === "weak" ? "border-l-red-500 bg-red-50/50" :
      "border-l-blue-500 bg-blue-50/50"
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {validation.status === "strong" ? <CheckCircle className="h-4 w-4 text-green-600" /> :
              validation.status === "moderate" ? <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                validation.status === "weak" ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                  <Target className="h-4 w-4 text-blue-600" />}
            Current Status: {validation.message}
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
        <p className="text-sm text-foreground">{getInsightMessage()}</p>
      </CardContent>
    </Card>
  );
}

// --- Reusable Component: Expandable Comment ---
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

// --- Reusable Component: Feedback Themes ---
function FeedbackThemes({ feedback }: { feedback: Feedback[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const noResponses = feedback.filter(f => f.response === "no");
  const themes = extractFeedbackThemes(feedback);

  if (noResponses.length === 0) return null;

  return (
    <div className="border rounded-lg mb-4">
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
            This feedback is gold! Use it to guide your next iteration.
          </p>
        </div>
      )}
    </div>
  );
}

// --- Reusable Component: Data Table ---
function DataTable({ 
  data, 
  type, 
  emptyState 
}: { 
  data: Signup[] | Feedback[], 
  type: "signups" | "feedback",
  emptyState: React.ReactNode 
}) {
  if (data.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {type === "signups" ? (
              <>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </>
            ) : (
              <>
                <TableHead>Response</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {emptyState}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {type === "signups" ? (
            <>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </>
          ) : (
            <>
              <TableHead>Response</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {type === "signups" ? (
          (data as Signup[]).map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.email}</TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                <div className="text-right">
                  <div>{getTimeIndicator(s.created_at)}</div>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          (data as Feedback[]).map((f) => (
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
  );
}

// --- Empty State Components ---
function EmptySignupsState() {
  return (
    <TableRow>
      <TableCell colSpan={2} className="text-center py-12">
        <div className="space-y-3">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <div>
            <p className="font-medium text-foreground">Waiting for your first signup!</p>
            <p className="text-sm text-muted-foreground">
              Share your link to start collecting interested emails
            </p>
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
            <p className="font-medium text-foreground">Ready for your first feedback!</p>
            <p className="text-sm text-muted-foreground">
              Share your page to discover if people want your idea
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// --- Reusable Component: Actionable Insights ---
function ActionableInsights({ signups, feedback }: { signups: Signup[], feedback: Feedback[] }) {
  const validation = getValidationStatus(signups, feedback);

  const getRecommendations = () => {
    if (validation.status === "strong") {
      return {
        title: "Strong Validation - Time to Build!",
        icon: "🎉",
        actions: [
          { icon: "🏗️", text: "Start building your product", priority: "high" },
          { icon: "📧", text: `Email your ${signups.length} signups with a timeline`, priority: "high" },
          { icon: "📝", text: "Document what resonated most in positive feedback", priority: "medium" },
        ]
      };
    }
    
    if (validation.status === "moderate") {
      return {
        title: "Mixed Results - Time to Iterate",
        icon: "🤔",
        actions: [
          { icon: "🔍", text: "Analyze negative feedback for improvement ideas", priority: "high" },
          { icon: "📝", text: "Test a refined pitch addressing main concerns", priority: "high" },
          { icon: "👥", text: "Interview some 'No' respondents for deeper insights", priority: "medium" },
        ]
      };
    }
    
    if (validation.status === "weak") {
      return {
        title: "Weak Validation - Consider Pivoting",
        icon: "🔄",
        actions: [
          { icon: "🤔", text: "Seriously consider pivoting your approach", priority: "high" },
          { icon: "📊", text: "Analyze all negative feedback for patterns", priority: "high" },
          { icon: "💡", text: "Brainstorm solutions to main objections", priority: "medium" },
        ]
      };
    }

    return {
      title: "Keep Collecting Data",
      icon: "📈",
      actions: [
        { icon: "📈", text: "Continue sharing to gather more feedback", priority: "high" },
        { icon: "🎯", text: "Try different audiences and channels", priority: "medium" },
        { icon: "📊", text: "Monitor which channels drive most engagement", priority: "low" },
      ]
    };
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground flex items-center gap-2">
        {recommendations.icon} {recommendations.title}
      </h3>
      <ul className="space-y-3">
        {recommendations.actions.map((action, index) => (
          <li key={index} className={`flex items-start gap-3 ${
            action.priority === "high" ? "text-foreground" :
            action.priority === "medium" ? "text-muted-foreground" :
            "text-muted-foreground/70"
          }`}>
            <span className="text-base">{action.icon}</span>
            <div className="flex-1">
              <span className={action.priority === "high" ? "font-medium" : ""}>{action.text}</span>
              {action.priority === "high" && (
                <Badge variant="secondary" className="ml-2 text-xs">Priority</Badge>
              )}
            </div>
          </li>
        ))}
      </ul>
      
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          Need help interpreting your results?{" "}
          <a
            href="mailto:info@GoNo-Go.com"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            <Mail className="h-3 w-3" /> Contact us
          </a>
        </p>
      </div>
    </div>
  );
}

// --- Helper: Get Nudge Messages ---
function getNudgeForStep(stepNumber: number, signups: Signup[], feedback: Feedback[]): string | undefined {
  const hasAnyData = signups.length > 0 || feedback.length > 0;
  const timeSinceLastActivity = getTimeSinceActivity([...signups, ...feedback]);
  
  if (stepNumber === 1 && !hasAnyData) {
    return "Start here - share your link to begin validation";
  }
  
  if (stepNumber === 3 && hasAnyData && timeSinceLastActivity?.includes("days")) {
    return "No recent activity - consider sharing again";
  }
  
  if (stepNumber === 3 && hasAnyData && feedback.length < 3) {
    return "Keep sharing to collect more feedback for better insights";
  }
  
  return undefined;
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
  
  // Manual step completion tracking
  const [stepCompletions, setStepCompletions] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false
  });

  const handleComingSoon = (featureName: string) => {
    setComingSoonFeature(featureName);
    setShowComingSoon(true);
  };

  const handleStepCompletion = (step: keyof typeof stepCompletions, checked: boolean) => {
    setStepCompletions(prev => ({ ...prev, [step]: checked }));
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
  const hasAnyData = signups.length > 0 || feedback.length > 0;
  
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"}/p/${slug}`;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"}/p/${slug}/admin`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="text-xs font-semibold px-2 py-1">
            Admin Dashboard
          </Badge>
          <h1 className="text-3xl font-bold">{page.headline}</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Follow these steps to validate your idea and collect potential customers.
        </p>

        {/* Current Status */}
        <ValidationSummary signups={signups} feedback={feedback} />

        {/* Stats Overview */}
        <QuickStatsRow signups={signups} feedback={feedback} />

        {/* Sequential Steps */}
        <div className="space-y-6">
          {/* Step 1: Share Public Link */}
          <StepCard
            stepNumber={1}
            title="Share Your Validation Page"
            description="Copy this link and share it with your target audience to start collecting feedback"
            checkboxId="step1"
            isChecked={stepCompletions.step1}
            onCheckboxChange={(checked) => handleStepCompletion('step1', checked)}
            nudge={getNudgeForStep(1, signups, feedback)}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  value={publicUrl}
                  readOnly
                  className="font-mono text-sm bg-background border-primary/30"
                />
                <CopyButton
                  textToCopy={publicUrl}
                  className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Where to share:</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• Reddit communities (r/SideProject, r/entrepreneur)</div>
                  <div>• Twitter/X with relevant hashtags</div>
                  <div>• Direct emails to potential customers</div>
                  <div>• Discord/Slack communities in your niche</div>
                </div>
              </div>
              
              {hasAnyData && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Great! You've started collecting data. Keep sharing to get more feedback.
                </div>
              )}
            </div>
          </StepCard>

          {/* Step 2: Save Admin Link */}
          <StepCard
            stepNumber={2}
            title="Save Your Admin Dashboard Link"
            description="Bookmark this private link to track your progress. Never share this with anyone!"
            checkboxId="step2"
            isChecked={stepCompletions.step2}
            onCheckboxChange={(checked) => handleStepCompletion('step2', checked)}
          >
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Keep This Private!</span>
                </div>
                <p className="text-xs text-red-700">
                  This link gives access to all your data. Never share it publicly or with others.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={adminUrl}
                  type="password"
                  readOnly
                  className="font-mono text-xs bg-muted/50 border-muted flex-1"
                />
                <CopyButton
                  textToCopy={adminUrl}
                  className="h-9 px-3 text-xs"
                />
                <BookmarkButton className="h-9 w-9 p-0">
                  <Bookmark className="h-4 w-4" />
                </BookmarkButton>
              </div>

              <p className="text-xs text-muted-foreground">
                Tip: Bookmark this page or save the link somewhere safe.
              </p>
            </div>
          </StepCard>

          {/* Step 3: Monitor & Analyze */}
          <StepCard
            stepNumber={3}
            title="Monitor Your Results"
            description="Track signups and feedback as they come in. Analyze patterns to improve your idea."
            checkboxId="step3"
            isChecked={stepCompletions.step3}
            onCheckboxChange={(checked) => handleStepCompletion('step3', checked)}
            nudge={getNudgeForStep(3, signups, feedback)}
          >
            <div className="space-y-4">
              {!hasAnyData ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data yet. Complete Step 1 to see results here.</p>
                </div>
              ) : (
                <Tabs defaultValue="feedback" className="w-full">
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

                  <TabsContent value="feedback" className="space-y-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        What potential customers think about your idea.
                      </p>
                    </div>

                    <FeedbackThemes feedback={feedback} />

                    <DataTable 
                      data={feedback} 
                      type="feedback"
                      emptyState={<EmptyFeedbackState />}
                    />
                  </TabsContent>

                  <TabsContent value="signups" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        People interested in your idea.
                      </p>
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
                    
                    <DataTable 
                      data={signups} 
                      type="signups"
                      emptyState={<EmptySignupsState />}
                    />
                  </TabsContent>

                  <TabsContent value="idea" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Your original idea. Compare this to the feedback you're receiving.
                    </p>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm leading-relaxed text-foreground">{page.idea}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </StepCard>

          {/* Step 4: Take Action + Coming Soon Features */}
          <StepCard
            stepNumber={4}
            title="Take Action & Advanced Features"
            description="Use your validation data to make informed decisions and access advanced tools"
            checkboxId="step4"
            isChecked={stepCompletions.step4}
            onCheckboxChange={(checked) => handleStepCompletion('step4', checked)}
          >
            <div className="space-y-6">
              {/* Current Actionable Insights */}
              {feedback.length > 0 ? (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Based on your current data:</h4>
                  <ActionableInsights signups={signups} feedback={feedback} />
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Collect feedback to unlock actionable insights.</p>
                </div>
              )}

              {/* Coming Soon Features */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  🚀 Advanced Features Coming Soon
                  <Badge variant="secondary" className="text-xs">Premium</Badge>
                </h4>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => handleComingSoon("Landing Page Editor")}
                  >
                    <div>
                      <div className="font-medium text-sm">✏️ Edit Landing Page</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Customize your validation page design
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => handleComingSoon("Email Campaign Tool")}
                  >
                    <div>
                      <div className="font-medium text-sm">📧 Email Campaigns</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Send updates to your subscribers
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => handleComingSoon("Advanced Analytics")}
                  >
                    <div>
                      <div className="font-medium text-sm">📊 Advanced Analytics</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Deep insights and trend analysis
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => handleComingSoon("A/B Testing")}
                  >
                    <div>
                      <div className="font-medium text-sm">🧪 A/B Testing</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Test different versions of your idea
                      </div>
                    </div>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Want early access? <a href="mailto:info@GoNo-Go.com" className="text-primary hover:underline">Contact us</a>
                </p>
              </div>
            </div>
          </StepCard>
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
                    {comingSoonFeature === "Landing Page Editor" && (
                      <>
                        <li>Visual page editor</li>
                        <li>Custom themes and colors</li>
                        <li>Multiple page templates</li>
                      </>
                    )}
                    {comingSoonFeature === "Email Campaign Tool" && (
                      <>
                        <li>Email template builder</li>
                        <li>Automated follow-ups</li>
                        <li>Campaign analytics</li>
                      </>
                    )}
                    {comingSoonFeature === "Advanced Analytics" && (
                      <>
                        <li>Traffic source tracking</li>
                        <li>Conversion funnel analysis</li>
                        <li>Geographic insights</li>
                      </>
                    )}
                    {comingSoonFeature === "A/B Testing" && (
                      <>
                        <li>Multiple idea variations</li>
                        <li>Split traffic automatically</li>
                        <li>Statistical significance testing</li>
                      </>
                    )}
                  </ul>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Want to be notified when it's ready? Drop us a line at{" "}
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