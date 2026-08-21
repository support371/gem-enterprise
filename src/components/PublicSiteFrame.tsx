"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { ProductionDisclosure } from "@/components/ProductionDisclosure";
import { isManagementAccessPath } from "@/lib/managementSurfaces";

interface PublicSiteFrameProps {
  children: React.ReactNode;
  isPortal: boolean;
}

export function PublicSiteFrame({ children, isPortal }: PublicSiteFrameProps) {
  const pathname = usePathname();
  const isManagementSurface = isPortal || isManagementAccessPath(pathname);

  if (isManagementSurface) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-cyan-300 focus:px-4 focus:py-2 focus:font-bold focus:text-[#071019]"
      >
        Skip to main content
      </a>
      <Navigation />
      <ProductionDisclosure />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
