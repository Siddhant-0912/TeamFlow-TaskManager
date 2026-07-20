import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 sm:px-6 md:pb-5 lg:px-8">
        {children}
      </main>
    </div>
  );
}
