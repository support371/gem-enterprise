"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Grid2X2, Shield } from "lucide-react";
import { adminPortalNavGroups, adminPortalNavItems } from "@/lib/platformNavigation";
import { cn } from "@/lib/utils";

function currentItem(pathname: string) {
  return [...adminPortalNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

export function AdminSectionNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const active = currentItem(pathname) ?? adminPortalNavItems[0];

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => {
        if (mounted) setViewerRole(session?.role ?? null);
      })
      .catch(() => {
        if (mounted) setViewerRole(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visibleGroups = useMemo(
    () => adminPortalNavGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.ownerOnly || viewerRole === "super_admin"),
    })),
    [viewerRole],
  );

  if (pathname === "/app/admin") return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-xs text-slate-500">
          <Link href="/app/admin" className="flex shrink-0 items-center gap-1.5 hover:text-cyan-300">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            Admin Center
          </Link>
          {active?.href !== "/app/admin" ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate font-medium text-slate-300">{active?.label ?? "Admin page"}</span>
            </>
          ) : null}
        </div>

        <div className="relative">
          <Grid2X2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" aria-hidden="true" />
          <label htmlFor="admin-page-select" className="sr-only">Open an admin page</label>
          <select
            id="admin-page-select"
            value={active?.href ?? "/app/admin"}
            onChange={(event) => router.push(event.target.value)}
            className="h-10 w-full appearance-none rounded-xl border border-white/10 bg-[#101821] pl-10 pr-9 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 sm:w-64"
          >
            {visibleGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((item) => (
                  <option key={item.href} value={item.href}>{item.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-500" aria-hidden="true" />
        </div>
      </div>

      <nav aria-label="Administration pages" className="mt-3 hidden gap-2 overflow-x-auto pb-1 sm:flex">
        {visibleGroups.map((group) => {
          const groupActive = group.items.some(
            (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
          );
          const destination = group.items[0]?.href ?? "/app/admin";
          return (
            <Link
              key={group.label}
              href={destination}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition",
                groupActive
                  ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white",
              )}
            >
              {group.label}
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
