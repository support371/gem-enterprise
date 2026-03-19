'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
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

// ── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarContent({ isAdmin, pathname }: { isAdmin: boolean; pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'hsl(185 100% 45%)' }}
        >
          <span className="text-black font-bold text-sm">G</span>
        </div>
        <span className="font-semibold text-sm text-white truncate">GEM Enterprise</span>
      </div>

      {/* Client Nav */}
      <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
        {clientNavGroups.map(({ label, items }) => (
          <div key={label}>
            <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, icon: Icon, label: itemLabel }) => {
                const active = pathname === href || (href !== '/app/dashboard' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                      active
                        ? 'nav-active'
                        : 'text-slate-400 hover:text-white hover:bg-white/8'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        active
                          ? 'text-[hsl(var(--svc-cyber))]'
                          : 'text-slate-500 group-hover:text-[hsl(var(--svc-cyber))]'
                      )}
                    />
                    <span className="truncate">{itemLabel}</span>
                    {active && <span className="ml-auto w-1 h-1 rounded-full bg-[hsl(var(--svc-cyber))]" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Nav */}
      {isAdmin && (
        <div className="border-t border-white/10 px-2 py-4 space-y-0.5">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Admin
          </p>
          {adminNavItems.map(({ href, icon: Icon, label: itemLabel }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                  active
                    ? 'nav-active'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    active
                      ? 'text-[hsl(var(--svc-financial))]'
                      : 'text-slate-500 group-hover:text-[hsl(var(--svc-financial))]'
                  )}
                />
                <span className="truncate">{itemLabel}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Derive page title from pathname for breadcrumb
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
  const pageTitle = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

  // Client-side role check (header-based auth handled by middleware/API)
  const isAdmin = false

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 border-r border-white/10 glass-panel sticky top-0 h-screen overflow-hidden">
        <SidebarContent isAdmin={isAdmin} pathname={pathname} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-white/10 glass-panel flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-0 bg-background border-white/10">
                <SidebarContent isAdmin={isAdmin} pathname={pathname} />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb */}
            <nav className="hidden lg:flex items-center gap-1.5 text-sm text-slate-400">
              <span className="text-slate-500">App</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium">{pageTitle}</span>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/app/notifications">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--svc-cyber))] animate-pulse-slow" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 text-slate-300 hover:text-white">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-[hsl(var(--svc-cyber-muted))] text-[hsl(var(--svc-cyber))] text-xs font-semibold">
                      VC
                    </AvatarFallback>
                  </Avatar>
                  <ChevronRight className="w-3 h-3 rotate-90 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border-white/10">
                <DropdownMenuItem asChild>
                  <Link href="/app/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/logout" className="flex items-center gap-2 cursor-pointer text-red-400">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Governed AI chat widget — disclosure shown before first message (ADR-003) */}
      <AIChatWidget profileId="PRF-005" profileName="Platform Support" />
    </div>
  )
}
