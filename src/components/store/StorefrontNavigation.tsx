"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { storefrontDefinitions } from "@/lib/storefrontCatalog";

export function StorefrontNavigation() {
  const pathname = usePathname();
  const links = [
    { slug: "all", label: "All Products", href: "/store" },
    ...storefrontDefinitions.map((storefront) => ({
      slug: storefront.slug,
      label: storefront.shortName,
      href: `/store/${storefront.slug}`,
    })),
  ];

  return (
    <nav aria-label="Store sections" className="sticky top-0 z-40 border-b border-white/10 bg-[#07101c]/95 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl overflow-x-auto px-6">
        <div className="flex min-w-max gap-2 py-4">
          {links.map((link) => {
            const isActive =
              link.href === "/store"
                ? pathname === "/store"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.slug}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-cyan-400 bg-cyan-400 text-black"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
