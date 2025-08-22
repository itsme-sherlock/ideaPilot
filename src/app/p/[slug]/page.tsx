import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import { SignupForm } from '@/components/signup-form';
import { FeedbackWidget } from '@/components/feedback-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PageProps = {
  params: { slug: string };
};

async function getPageData(slug: string) {
  try {
    const pagesRef = collection(db, 'pages');
    const q = query(pagesRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const pageDoc = querySnapshot.docs[0];
    return {
      id: pageDoc.id,
      ...pageDoc.data()
    } as { id: string; headline: string; subHeadline: string };
  } catch (error) {
    console.error("Firebase error:", error);
    return null;
  }
}

export default async function PublicPage({ params }: PageProps) {
  const pageData = await getPageData(params.slug);

  if (!pageData) {
    notFound();
  }
  
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary mb-4 font-headline">
        {pageData.headline}
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-12">
        {pageData.subHeadline}
      </p>

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
