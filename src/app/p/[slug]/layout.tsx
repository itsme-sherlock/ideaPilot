import { Footer } from '@/components/footer';

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
