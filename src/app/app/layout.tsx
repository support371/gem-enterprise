"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
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
  ChevronRight,
  LogOut,
  Menu,
  UserCheck,
  Wallet,
  Vault,
} from 'lucide-react'
import { AIChatWidget } from '@/components/AIChatWidget'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// ── Nav definitions ──────────────────────────────────────────────────────────

const clientNavGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/app/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/app/portfolios', icon: Briefcase,        label: 'Portfolios' },
      { href: '/app/my-portfolio', icon: Wallet,        label: 'My Portfolio' },
      { href: '/app/savings-vault', icon: Vault,        label: 'Savings Vault' },
      { href: '/app/products',   icon: Package,          label: 'Products' },
      { href: '/app/profiles',   icon: UserCheck,        label: 'Profiles' },
    ],
  },
  {
    label: 'Portal',
    items: [
      { href: '/app/services',   icon: Package,          label: 'Services' },
      { href: '/app/community',  icon: Users,            label: 'Community' },
      { href: '/app/workspace',  icon: MessageSquare,    label: 'Workspace' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/app/documents',     icon: FileText,        label: 'Documents' },
      { href: '/app/requests',      icon: ClipboardList,   label: 'Requests' },
      { href: '/app/messages',      icon: MessageSquare,   label: 'Messages' },
      { href: '/app/notifications', icon: Bell,            label: 'Notifications' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/app/support',    icon: HeadphonesIcon, label: 'Support' },
      { href: '/app/compliance', icon: ShieldCheck,    label: 'Compliance' },
      { href: '/app/profile',    icon: User,           label: 'Profile' },
      { href: '/app/settings',   icon: Settings,       label: 'Settings' },
      { href: '/app/security',   icon: Lock,           label: 'Security' },
    ],
  },
]

const adminNavItems = [
  { href: '/app/admin',              icon: Shield,        label: 'Admin Center' },
  { href: '/app/admin/kyc',          icon: CheckCircle,   label: 'KYC Queue' },
  { href: '/app/admin/approvals',    icon: ClipboardList, label: 'Approvals' },
  { href: '/app/admin/users',        icon: Users,         label: 'Users' },
  { href: '/app/admin/allocations',  icon: PieChart,      label: 'Allocations' },
]
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  adminPortalNavItems,
  clientPortalNavGroups,
  type PlatformNavIcon,
} from "@/lib/platformNavigation";

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
};

function SidebarContent({ isAdmin, pathname }: { isAdmin: boolean; pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "hsl(185 100% 45%)" }}
        >
          <span className="text-sm font-bold text-black">G</span>
        </div>
        <span className="truncate text-sm font-semibold text-white">GEM Enterprise</span>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {clientPortalNavGroups.map(({ label, items }) => (
          <div key={label}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, icon, label: itemLabel }) => {
                const Icon = iconMap[icon];
                const active = pathname === href || (href !== "/app/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
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
                    {active && <span className="ml-auto h-1 w-1 rounded-full bg-[hsl(var(--svc-cyber))]" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {isAdmin && (
        <div className="space-y-0.5 border-t border-white/10 px-2 py-4">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Admin
          </p>
          {adminPortalNavItems.map(({ href, icon, label: itemLabel }) => {
            const Icon = iconMap[icon];
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
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
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  const pageTitle = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  const isAdmin = false;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="glass-panel sticky top-0 hidden h-screen w-56 shrink-0 overflow-hidden border-r border-white/10 lg:flex xl:w-64">
        <SidebarContent isAdmin={isAdmin} pathname={pathname} />
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
              <SheetContent side="left" className="w-56 border-white/10 bg-background p-0">
                <SidebarContent isAdmin={isAdmin} pathname={pathname} />
              </SheetContent>
            </Sheet>

            <nav className="hidden items-center gap-1.5 text-sm text-slate-400 lg:flex">
              <span className="text-slate-500">App</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-white">{pageTitle}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
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
                      VC
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

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      <AIChatWidget profileId="PRF-005" profileName="Platform Support" />
    </div>
  );
}
