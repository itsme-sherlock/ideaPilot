
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
import { Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { Bookmark, AlertTriangle } from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import { FeedbackFab } from "@/components/feedback-fab";



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
}

// --- Loading Skeleton ---
function AdminSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="h-8 w-96 bg-muted rounded"></div>
        <div className="h-4 w-48 bg-muted rounded"></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-32 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
      <div className="space-y-6">
        <div className="h-64 bg-muted rounded"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    </div>
  );
}

// --- Format Time Ago ---
function timeAgo(date: string) {
  return format(new Date(date), "MMM d, yyyy");
}

// --- Main Component ---
export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getAdminData(slug);

  if (!data) return notFound();

  const { page, signups, feedback } = data;

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"
    }/p/${slug}`;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"
    }/p/${slug}/admin`;

    
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs font-semibold px-2 py-1">
          Admin
        </Badge>
        <h1 className="text-3xl font-bold">{page.headline}</h1>
      </div>
      <p className="text-muted-foreground">
        Track interest and feedback for your landing page.
      </p>

      {/* Admin Link (for recovery) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔐 Your Admin Dashboard
          </CardTitle>
          <CardDescription>
            Save this link to track results later (bookmark it!)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={adminUrl}
              readOnly
              className="font-mono text-sm bg-background text-xs"
              aria-label="Admin dashboard URL"
            />
            <CopyButton
              textToCopy={adminUrl}
              aria-label="Copy admin URL to clipboard"
            />
            <BookmarkButton />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            If you lose this link, you won’t be able to access your results.
          </p>
        </CardContent>
      </Card>


      {/* Share Public Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" /> Share Your Page
          </CardTitle>
          <CardDescription>
            Send this link to get feedback or collect emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={publicUrl} readOnly className="font-mono text-sm" />
            <CopyButton textToCopy={publicUrl} />
          </div>
        </CardContent>
      </Card>

      {/* Your Original Idea */}
      <Card>
        <CardHeader>
          <CardTitle>Your Original Idea</CardTitle>
          <CardDescription>
            This is what you started with. Compare it to feedback below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{page.idea}</p>
        </CardContent>
      </Card>

      {/* Signups */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Email Signups ({signups.length})</CardTitle>
            <CardDescription>People interested in your idea.</CardDescription>
          </div>
          {signups.length > 0 && (
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          )}
        </CardHeader>
        <CardContent>
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
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
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
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Feedback ({feedback.length})</CardTitle>
            <CardDescription>What potential customers think.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
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
        </CardContent>
      </Card>

      

      {/* What's Next? */}
      <div className="mt-12 p-6 bg-muted rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">What’s Next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• <strong>Share your link</strong> on Reddit, Indie Hackers, or Twitter</li>
          <li>• <strong>Email your signups</strong> with a personal message</li>
          <li>• <strong>Update your idea</strong> based on “No” responses</li>
          <li>• Come back tomorrow — momentum builds fast!</li>
        </ul>
      </div>
      
      <FeedbackFab slug={slug} />
    </div>
  );
}