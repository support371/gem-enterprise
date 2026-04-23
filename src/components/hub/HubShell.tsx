"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Briefcase,
  Users,
  Compass,
  CalendarDays,
  BookOpenText,
  Inbox,
  MessageSquare,
  UserCircle2,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HubNavItem {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  protected?: boolean;
  divider?: boolean;
}

const HUB_NAV: HubNavItem[] = [
  { href: "/community-hub", label: "Overview", icon: LayoutGrid },
  { href: "/community-hub/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/community-hub/members", label: "Members", icon: Users },
  { href: "/community-hub/circles", label: "Strategic Circles", icon: Compass },
  { href: "/community-hub/events", label: "Events", icon: CalendarDays },
  { href: "/community-hub/knowledge", label: "Knowledge Center", icon: BookOpenText },
  { href: "/community-hub/requests", label: "Requests", icon: Inbox, protected: true, divider: true },
  { href: "/community-hub/messages", label: "Messages", icon: MessageSquare, protected: true },
  { href: "/community-hub/profile", label: "Profile", icon: UserCircle2, protected: true },
  { href: "/community-hub/settings", label: "Settings", icon: Settings, protected: true },
];

interface HubShellProps {
  children: ReactNode;
}

/**
 * Hub shell — sticky sub-navigation + page container.
 * Sits below the global site header on every /community-hub/* route.
 * Uses horizontal scrolling on small screens; segmented pill on desktop.
 */
export function HubShell({ children }: HubShellProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/community-hub") return pathname === "/community-hub";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sub-nav bar */}
      <div
        className="sticky top-16 z-30 border-b border-white/[0.06] bg-[#0e1420]/90 backdrop-blur-xl"
        aria-label="Community Hub navigation"
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto py-3 scrollbar-hide">
            <div className="flex shrink-0 items-center gap-2 border-r border-white/[0.08] pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/25">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/80">
                Community Hub
              </span>
            </div>

            <nav className="flex items-center gap-0.5">
              {HUB_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <span key={item.href} className="flex items-center">
                    {item.divider && (
                      <span
                        aria-hidden="true"
                        className="mx-2 h-5 w-px bg-white/[0.08]"
                      />
                    )}
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary ring-1 ring-primary/25"
                          : "text-white/55 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.label}
                      {item.protected && (
                        <span
                          aria-label="Members only"
                          className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary/60"
                        />
                      )}
                    </Link>
                  </span>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
