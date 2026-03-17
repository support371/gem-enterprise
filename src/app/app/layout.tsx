import { headers } from 'next/headers'
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
} from 'lucide-react'
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

const clientNavItems = [
  { href: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/products', icon: Package, label: 'Products' },
  { href: '/app/portfolios', icon: Briefcase, label: 'Portfolios' },
  { href: '/app/documents', icon: FileText, label: 'Documents' },
  { href: '/app/requests', icon: ClipboardList, label: 'Requests' },
  { href: '/app/support', icon: HeadphonesIcon, label: 'Support' },
  { href: '/app/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/app/notifications', icon: Bell, label: 'Notifications' },
  { href: '/app/compliance', icon: ShieldCheck, label: 'Compliance' },
  { href: '/app/profile', icon: User, label: 'Profile' },
  { href: '/app/settings', icon: Settings, label: 'Settings' },
  { href: '/app/security', icon: Lock, label: 'Security' },
]

const adminNavItems = [
  { href: '/app/admin', icon: Shield, label: 'Admin Center' },
  { href: '/app/admin/kyc', icon: CheckCircle, label: 'KYC Queue' },
  { href: '/app/admin/approvals', icon: ClipboardList, label: 'Approvals' },
  { href: '/app/admin/users', icon: Users, label: 'Users' },
  { href: '/app/admin/allocations', icon: PieChart, label: 'Allocations' },
]

function SidebarContent({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'hsl(185 100% 45%)' }}>
          <span className="text-black font-bold text-sm">G</span>
        </div>
        <span className="font-semibold text-sm text-white truncate sidebar-label">GEM Enterprise</span>
      </div>

      {/* Client Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {clientNavItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors group"
          >
            <Icon className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="sidebar-label truncate">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Admin Nav */}
      {isAdmin && (
        <div className="border-t border-white/10 px-2 py-4 space-y-0.5">
          <p className="sidebar-label px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Admin
          </p>
          {adminNavItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors group"
            >
              <Icon className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="sidebar-label truncate">{label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const userRole = headersList.get('x-user-role') ?? 'client'
  const isAdmin = userRole === 'admin' || userRole === 'super_admin'

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/10 glass-panel sticky top-0 h-screen overflow-hidden">
        <SidebarContent isAdmin={isAdmin} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-white/10 glass-panel flex items-center justify-between px-4 sticky top-0 z-30">
          {/* Mobile menu */}
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-background border-white/10">
                <SidebarContent isAdmin={isAdmin} />
              </SheetContent>
            </Sheet>
            <div className="hidden lg:block w-px h-5 bg-white/10" />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/app/notifications">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 text-slate-300 hover:text-white">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs font-semibold">VC</AvatarFallback>
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

    </div>
  )
}
