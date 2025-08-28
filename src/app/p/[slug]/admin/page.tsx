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
import { Link, MessageSquare, Users, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { Bookmark, AlertTriangle } from "lucide-react";
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

// --- Format Time Ago ---
function timeAgo(date: string) {
  return format(new Date(date), "MMM d, yyyy");
}

// --- Stats Summary Component ---
function StatsSummary({ signups, feedback }: { signups: Signup[], feedback: Feedback[] }) {
  const yesResponses = feedback.filter(f => f.response === "yes").length;
  const totalResponses = feedback.length;
  const interestRate = totalResponses > 0 ? Math.round((yesResponses / totalResponses) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl text-primary font-bold">{signups.length}</div>
          <p className="text-xs text-muted-foreground">Email signups</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl text-primary font-bold">{totalResponses}</div>
          <p className="text-xs text-muted-foreground">Total feedback</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl text-primary font-bold">{interestRate}%</div>
          <p className="text-xs text-muted-foreground">Interest rate</p>
        </CardContent>
      </Card>
    </div>
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
            <div className="grid gap-4 md:grid-cols-3">
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

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"
    }/p/${slug}`;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"
    }/p/${slug}/admin`;

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

        {/* Stats Overview */}
        <StatsSummary signups={signups} feedback={feedback} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* PRIMARY ACTION: Share Public Link (Most Important) */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-primary" />
                  <span className="text-lg">Share Your Page to Get Feedback</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  This is the most important step — copy and share this link to validate your idea.
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
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Share on Reddit, Twitter, or directly with potential customers
                </p>
              </CardContent>
            </Card>

            {/* SECONDARY ACTION: Admin Dashboard (Less Important) */}
            <Card className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  🔐 Save Admin Dashboard
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    value={adminUrl}
                    readOnly
                    className="font-mono text-xs bg-muted/50 border-muted text-muted-foreground"
                  />
                  <CopyButton 
                    textToCopy={adminUrl}
                    className="text-muted-foreground border-muted hover:bg-muted/50 h-8 px-3 text-xs"
                  />
                  <BookmarkButton className="text-muted-foreground hover:bg-muted/50 h-8 w-8 p-0">
                    <Bookmark className="h-3 w-3" />
                  </BookmarkButton>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Bookmark this page to check results later
                </p>
              </CardContent>
            </Card>

            {/* Tabbed Content - MAIN CHANGE: Using tabs instead of stacked cards */}
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
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                              No feedback yet. Share your page to get real reactions.
                            </TableCell>
                          </TableRow>
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
                                <div className="line-clamp-2 text-sm leading-relaxed text-foreground">
                                  {f.comment || (
                                    <span className="text-muted-foreground italic">No comment</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {timeAgo(f.created_at)}
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
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                              No one has signed up yet. Share your link to start collecting interest.
                            </TableCell>
                          </TableRow>
                        ) : (
                          signups.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium">{s.email}</TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {timeAgo(s.created_at)}
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

          {/* Sticky Sidebar - MAIN CHANGE: Moved "What's Next" to sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">1.</span>
                      <span><strong>Share your link</strong> on Reddit, Indie Hackers, or Twitter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">2.</span>
                      <span><strong>Email your signups</strong> with a personal message</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">3.</span>
                      <span><strong>Update your idea</strong> based on "No" responses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-medium">4.</span>
                      <span>Come back tomorrow — momentum builds fast!</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

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
              <DialogDescription className="text-left space-y-3">
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
                    <span className="font-medium text-foreground">updates@yourapp.com</span>
                  </p>
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
    </div>
  );
}