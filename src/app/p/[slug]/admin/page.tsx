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
import { createClient } from "@supabase/supabase-js";

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
  // 1. Page
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id, headline, idea, creator_email")
    .eq("slug", slug)
    .single();

  if (pageError || !page) {
    console.error("Page fetch error:", pageError);
    return null;
  }

  // 2. Signups
  const { data: signups, error: signupsError } = await supabase
    .from("signups")
    .select("id, email, created_at")
    .eq("page_id", page.id)
    .order("created_at", { ascending: false });

  if (signupsError) console.error("Signups fetch error:", signupsError);

  // 3. Feedback
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

// --- Component ---
export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ Await params for Next.js App Router

  const data = await getAdminData(slug);
  if (!data) notFound();

  const { page, signups, feedback } = data;

  const publicUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"
  }/p/${slug}`;
  const adminUrl = `${publicUrl}/admin`;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">{page.headline}</h1>
        <p className="text-muted-foreground">Admin Dashboard</p>
      </div>

      {/* Links + Page Info */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" /> Your Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Public Page</label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={publicUrl} readOnly />
                <CopyButton textToCopy={publicUrl} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Admin Page (this one)</label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={adminUrl} readOnly />
                <CopyButton textToCopy={adminUrl} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong className="text-muted-foreground">Idea:</strong>{" "}
              {page.idea}
            </p>
            <p>
              <strong className="text-muted-foreground">Creator:</strong>{" "}
              {page.creator_email}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Signups + Feedback */}
      <div className="space-y-8">
        {/* Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Email Signups ({signups.length})</CardTitle>
            <CardDescription>People interested in your idea.</CardDescription>
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
                {signups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No signups yet.
                    </TableCell>
                  </TableRow>
                )}
                {signups.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell className="text-right">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback ({feedback.length})</CardTitle>
            <CardDescription>What potential customers think.</CardDescription>
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
                {feedback.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No feedback yet.
                    </TableCell>
                  </TableRow>
                )}
                {feedback.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <Badge
                        className={
                          f.response === "yes"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        }
                      >
                        {f.response}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {f.comment || (
                        <span className="text-muted-foreground italic">
                          No comment
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {f.created_at
                        ? new Date(f.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
