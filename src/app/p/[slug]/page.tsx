import { notFound } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { FeedbackWidget } from "@/components/feedback-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from 'react-markdown';

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
  const { slug } = await params; // ✅ Await params for App Router
  const pageData = await getPageData(slug);

  if (!pageData) notFound();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary mb-4 font-headline">
        {pageData.headline}
      </h1>
      <div className="text-xl md:text-2xl text-muted-foreground mb-12">
        <ReactMarkdown>
          {pageData.sub_headline || ""}
        </ReactMarkdown>
      </div>

      <div className="space-y-12">
        <Card className="text-left shadow-lg">
          <CardHeader>
            <CardTitle>Get Early Access & Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <SignupForm pageId={pageData.id} />
          </CardContent>
        </Card>

        <Card className="text-left shadow-lg">
          <CardHeader>
            <CardTitle>Would you buy this?</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackWidget pageId={pageData.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
