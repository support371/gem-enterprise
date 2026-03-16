import { PortalSidebar } from "./PortalSidebar";

interface PortalLayoutProps {
  children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <PortalSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile top padding so content isn't hidden behind the hamburger button */}
        <div className="lg:hidden h-14" />
        {children}
      </main>
    </div>
  );
}
