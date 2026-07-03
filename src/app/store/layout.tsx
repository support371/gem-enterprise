import type { ReactNode } from "react";
import { StorefrontNavigation } from "@/components/store/StorefrontNavigation";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StorefrontNavigation active="all" />
      {children}
    </>
  );
}
