import ResponsiveNav from "@/components/navigation/ResponsiveNav";
import { CreateMenuProvider } from "@/components/navigation/CreateMenuContext";

export default function ApplicationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CreateMenuProvider>
      {/* Responsive Navigation (fixed position) */}
      <ResponsiveNav />
        
      {/* Main Content Area */}
      {/* Mobile: full height minus bottom nav (80px = h-20) */}
      {/* Desktop: full height with left margin for sidebar */}
      <main className="h-[calc(100vh-5rem)] md:h-screen md:ml-16">
        {children}
      </main>
    </CreateMenuProvider>
  );
}
