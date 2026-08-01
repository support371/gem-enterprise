"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CheckSquare2,
  Film,
  LayoutDashboard,
  Megaphone,
  Network,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

const suiteItems = [
  {
    href: "/app/social-media",
    label: "Overview",
    description: "Workspace status and next actions",
    icon: LayoutDashboard,
  },
  {
    href: "/app/social-media/accounts",
    label: "Accounts",
    description: "Connect and review social destinations",
    icon: Network,
  },
  {
    href: "/app/social-media/content",
    label: "Content",
    description: "Campaigns, copy, and creative packages",
    icon: Megaphone,
  },
  {
    href: "/app/social-media/video",
    label: "Video",
    description: "Rendering, assets, and private previews",
    icon: Video,
  },
  {
    href: "/app/social-media/tokmetric",
    label: "TokMetric",
    description: "Full TikTok operating workspace",
    icon: Film,
  },
  {
    href: "/app/social-media/approvals",
    label: "Approvals",
    description: "Compliance and human decisions",
    icon: CheckSquare2,
  },
  {
    href: "/app/social-media/calendar",
    label: "Calendar",
    description: "Scheduling and publishing preparation",
    icon: CalendarDays,
  },
  {
    href: "/app/social-media/analytics",
    label: "Analytics",
    description: "Performance and learning signals",
    icon: BarChart3,
  },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/app/social-media") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SocialMediaSuiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Social Media Suite" className="rounded-2xl border border-white/10 bg-card/70 p-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {suiteItems.map(({ href, label, description, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              title={description}
              className={cn(
                "group min-w-[132px] rounded-xl border px-3 py-3 transition",
                active
                  ? "border-cyan-400/35 bg-cyan-400/10 text-white"
                  : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-cyan-300" : "text-slate-500 group-hover:text-cyan-300",
                  )}
                />
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-slate-500">{description}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
