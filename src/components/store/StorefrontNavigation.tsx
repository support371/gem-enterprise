import Link from "next/link";
import { storefrontDefinitions, type StorefrontSlug } from "@/lib/storefrontCatalog";

type StorefrontNavigationProps = {
  active?: StorefrontSlug | "all";
};

export function StorefrontNavigation({ active = "all" }: StorefrontNavigationProps) {
  const links = [
    { slug: "all" as const, label: "All Products", href: "/store" },
    ...storefrontDefinitions.map((storefront) => ({
      slug: storefront.slug,
      label: storefront.shortName,
      href: `/store/${storefront.slug}`,
    })),
  ];

  return (
    <nav aria-label="Store sections" className="border-b border-white/10 bg-[#07101c]">
      <div className="container mx-auto max-w-7xl overflow-x-auto px-6">
        <div className="flex min-w-max gap-2 py-4">
          {links.map((link) => {
            const isActive = active === link.slug;
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
