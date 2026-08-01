"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  FileText,
  HeadphonesIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  PieChart,
  PiggyBank,
  Plug,
  Rss,
  Scale,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { AIChatWidget } from "@/components/AIChatWidget";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  adminPortalNavItems,
  clientPortalNavGroups,
  type PlatformNavIcon,
} from "@/lib/platformNavigation";

const ADMIN_ROLES = new Set(["admin", "super_admin", "internal"]);

const iconMap: Record<PlatformNavIcon, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  Briefcase,
  FileText,
  ClipboardList,
  HeadphonesIcon,
  MessageSquare,
  Bell,
  ShieldCheck,
  User,
  Settings,
  Lock,
  Shield,
  Users,
  CheckCircle,
  PieChart,
  UserCheck,
  Wallet,
  PiggyBank,
  Mail,
  Rss,
  Activity,
  BarChart3,
  ShieldAlert,
  Scale,
  BadgeDollarSign,
  Bot,
  Plug,
  Megaphone,
  Building2,
};

function isActivePath(pathname: string, href: string) {
  if (href === "/app/dashboard" || href === "/intel") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({
  canAccessAdmin,
  pathname,
  viewerRole,
}: {
  canAccessAdmin: boolean;
  pathname: string;
  viewerRole: string | null;
}) {
  const visibleGroups = clientPortalNavGroups.filter(
    (group) => !group.adminOnly || canAccessAdmin,
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-5">
        <Link href="/app/dashboard" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "hsl(185 100% 45%)" }}
          >
            <span className="text-sm font-bold text-black">G</span>
          </div>
          <span className="truncate text-sm font-semibold text-white">GEM Enterprise</span>
        </Link>
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400">Operations Online</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Client, intelligence, social media, compliance, and service workflows aligned.
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {visibleGroups.map(({ label, items }) => (
          <div key={label}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, icon, label: itemLabel, description }) => {
                const Icon = iconMap[icon];
                const active = isActivePath(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    title={description}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active ? "nav-active" : "text-slate-400 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active
                          ? "text-[hsl(var(--svc-cyber))]"
                          : "text-slate-500 group-hover:text-[hsl(var(--svc-cyber))]",
                      )}
                    />
                    <span className="truncate">{itemLabel}</span>
                    {active ? (
                      <span className="ml-auto h-1 w-1 rounded-full bg-[hsl(var(--svc-cyber))]" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {canAccessAdmin ? (
        <div className="space-y-0.5 border-t border-white/10 px-2 py-4">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Administration
          </p>
          {adminPortalNavItems
            .filter((item) => !item.ownerOnly || viewerRole === "super_admin")
            .map(({ href, icon, label: itemLabel, description }) => {
              const Icon = iconMap[icon];
              const active = isActivePath(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={description}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active ? "nav-active" : "text-slate-400 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active
                        ? "text-[hsl(var(--svc-financial))]"
                        : "text-slate-500 group-hover:text-[hsl(var(--svc-financial))]",
                    )}
                  />
                  <span className="truncate">{itemLabel}</span>
                </Link>
              );
            })}
        </div>
      ) : null}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  const pageTitle = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  const canAccessAdmin = ADMIN_ROLES.has(viewerRole ?? "");
  const isAdminSurface =
    pathname.startsWith("/app/admin") || pathname.startsWith("/app/command-center");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => {
        if (active) setViewerRole(session?.role ?? null);
      })
      .catch(() => {
        if (active) setViewerRole(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const sidebar = (
    <SidebarContent
      canAccessAdmin={canAccessAdmin}
      pathname={pathname}
      viewerRole={viewerRole}
    />
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="glass-panel sticky top-0 hidden h-screen w-56 shrink-0 overflow-hidden border-r border-white/10 lg:flex xl:w-64">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-white/10 bg-background p-0">
                {sidebar}
              </SheetContent>
            </Sheet>

            <nav className="hidden items-center gap-1.5 text-sm text-slate-400 lg:flex">
              <span className="text-slate-500">GEM Enterprise</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-white">{pageTitle}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {isAdminSurface && canAccessAdmin ? (
              <Badge className="hidden border-cyan-500/25 bg-cyan-500/10 text-xs text-cyan-400 sm:inline-flex">
                Admin Ops
              </Badge>
            ) : null}
            <Link href="/app/notifications">
              <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--svc-cyber))] animate-pulse-slow" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 text-slate-300 hover:text-white">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-[hsl(var(--svc-cyber-muted))] text-xs font-semibold text-[hsl(var(--svc-cyber))]">
                      GE
                    </AvatarFallback>
                  </Avatar>
                  <ChevronRight className="h-3 w-3 rotate-90 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-white/10 bg-background">
                <DropdownMenuItem asChild>
                  <Link href="/app/profile" className="flex cursor-pointer items-center gap-2">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings" className="flex cursor-pointer items-center gap-2">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                {canAccessAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link href="/app/admin" className="flex cursor-pointer items-center gap-2">
                      <Shield className="h-4 w-4" /> Admin Center
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/logout" className="flex cursor-pointer items-center gap-2 text-red-400">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>

      <AIChatWidget profileId="PRF-005" profileName="Platform Support" />
    </div>
  );
}
