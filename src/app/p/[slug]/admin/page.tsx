import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/copy-button';

type AdminPageProps = {
  params: { slug: string };
};

type PageData = {
  id: string;
  headline: string;
  creatorEmail: string;
  idea: string;
};

type Signup = {
  id: string;
  email: string;
  createdAt: Date;
};

type Feedback = {
  id: string;
  response: 'yes' | 'no';
  comment: string;
  createdAt: Date;
};

async function getAdminData(slug: string) {
  try {
    const pagesRef = collection(db, 'pages');
    const q = query(pagesRef, where('slug', '==', slug), limit(1));
    const pageSnapshot = await getDocs(q);

    if (pageSnapshot.empty) return null;

    const pageDoc = pageSnapshot.docs[0];
    const pageId = pageDoc.id;

    const signupsRef = collection(db, 'pages', pageId, 'signups');
    const signupsQuery = query(signupsRef, orderBy('createdAt', 'desc'));
    const signupsSnapshot = await getDocs(signupsQuery);
    const signups = signupsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as Signup[];

    const feedbackRef = collection(db, 'pages', pageId, 'feedback');
    const feedbackQuery = query(feedbackRef, orderBy('createdAt', 'desc'));
    const feedbackSnapshot = await getDocs(feedbackQuery);
    const feedback = feedbackSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as Feedback[];

    return {
      page: { id: pageId, ...pageDoc.data() } as PageData,
      signups,
      feedback
    };
  } catch(e) {
    console.error(e)
    return null
  }
}

export default async function AdminPage({ params }: AdminPageProps) {
  const data = await getAdminData(params.slug);

  if (!data) notFound();

  const { page, signups, feedback } = data;
  
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/p/${params.slug}`;
  const adminUrl = `${publicUrl}/admin`;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">{page.headline}</h1>
        <p className="text-muted-foreground">Admin Dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Link className="h-5 w-5"/> Your Links</CardTitle>
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
            <p><strong className="text-muted-foreground">Idea:</strong> {page.idea}</p>
            <p><strong className="text-muted-foreground">Creator:</strong> {page.creatorEmail}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-8">
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
                {signups.length === 0 && <TableRow><TableCell colSpan={2} className="text-center">No signups yet.</TableCell></TableRow>}
                {signups.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell className="text-right">{s.createdAt?.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
                {feedback.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No feedback yet.</TableCell></TableRow>}
                {feedback.map(f => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <Badge className={f.response === 'yes' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                        {f.response}
                      </Badge>
                    </TableCell>
                    <TableCell>{f.comment || <span className="text-muted-foreground italic">No comment</span>}</TableCell>
                    <TableCell className="text-right">{f.createdAt?.toLocaleDateString()}</TableCell>
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
