import { notFound } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { FeedbackWidget } from "@/components/feedback-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";

// --- Types ---
type PageData = {
  id: string;
  headline: string;
  sub_headline: string | null;
};

// --- Supabase Client ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Data Fetcher ---
async function getPageData(slug: string): Promise<PageData | null> {
  const { data, error } = await supabase
    .from("pages")
    .select("id, headline, sub_headline")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Supabase error:", error);
    return null;
  }

  return data;
}

// --- Component ---
export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageData = await getPageData(slug);

  if (!pageData) notFound();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
      {/* Headline */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-primary mb-4 leading-tight">
        <ReactMarkdown
          components={{
            p: ({ children }) => <span>{children}</span>,
          }}
        >
          {pageData.headline}
        </ReactMarkdown>
      </h1>

      {/* Sub-headline */}
      {pageData.sub_headline && (
        <div className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          <ReactMarkdown
            components={{
              p: ({ children }) => <span>{children}</span>,
            }}
          >
            {pageData.sub_headline}
          </ReactMarkdown>
        </div>
      )}

      {/* Optional Visual Demo */}
      {/* Uncomment when a demo GIF or screenshot is ready */}
      {/* <div className="my-10 rounded-xl overflow-hidden bg-muted shadow-md">
        <img
          src="/demo-screenshot.png"
          alt="Demo of how the idea works"
          className="w-full"
        />
      </div> */}

      {/* CTA Section */}
      <div className="space-y-10">
        {/* Primary CTA: Signup */}
        <Card className="text-left shadow-lg border hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Get Early Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Be the first to try this idea and <span className="font-extrabold">shape its future.</span> We’ll only send meaningful updates.
            </p>
            <SignupForm pageId={pageData.id} />
          </CardContent>
        </Card>

        {/* Secondary CTA: Feedback */}
        <Card className="text-left shadow-lg border hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>What’s your take?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              No pressure—just curious if this solves a <b>real problem</b> for you.
            </p>
            <FeedbackWidget pageId={pageData.id} />
          </CardContent>
        </Card>
      </div>

      {/* Footer microcopy */}
      <p className="mt-12 text-sm text-muted-foreground">
        This is an early idea in motion. Your input helps us build what actually matters.
      </p>
    </div>
  );
}
