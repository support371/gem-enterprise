import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  Users,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
  Briefcase,
  MessageSquare,
  FolderOpen,
  UserCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, Role } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: Role[];
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/portal",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    label: "Services",
    href: "/portal/services",
    icon: Briefcase,
    allowedRoles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    label: "Tasks",
    href: "/portal/tasks",
    icon: ClipboardList,
    allowedRoles: ["admin", "manager", "analyst"],
  },
  {
    label: "Incidents",
    href: "/portal/incidents",
    icon: AlertTriangle,
    allowedRoles: ["admin", "manager", "analyst"],
  },
  {
    label: "Community",
    href: "/portal/community",
    icon: MessageSquare,
    allowedRoles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    label: "Workspace",
    href: "/portal/workspace",
    icon: FolderOpen,
    allowedRoles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    label: "Team",
    href: "/portal/team",
    icon: Users,
    allowedRoles: ["admin", "manager"],
  },
  {
    label: "Activity",
    href: "/portal/activity",
    icon: Activity,
    allowedRoles: ["admin", "manager", "analyst"],
  },
  {
    label: "Alliance Trust",
    href: "/portal/alliance-trust",
    icon: Building2,
    allowedRoles: ["admin", "manager", "analyst", "viewer"],
  },
  {
    label: "Settings",
    href: "/portal/settings",
    icon: Settings,
    allowedRoles: ["admin"],
  },
];

const roleLabel: Record<Role, string> = {
  admin: "Administrator",
  manager: "Manager",
  analyst: "Analyst",
  viewer: "Viewer",
};

interface PortalSidebarProps {
  className?: string;
}

export function PortalSidebar({ className }: PortalSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { role } = useUserRole();

  const visibleItems = navItems.filter(
    (item) => role !== null && item.allowedRoles.includes(role)
  );

  const isActive = (href: string) =>
    href === "/portal"
      ? location.pathname === "/portal" || location.pathname === "/portal/dashboard"
      : location.pathname === href || location.pathname.startsWith(href + "/");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-bold leading-tight">
          <span className="text-gradient-primary">GEM</span>
          <span className="text-sidebar-foreground/70 ml-1">Portal</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {/* Profile & Support links */}
        <Link
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === "/profile"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <UserCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">Profile</span>
        </Link>
        <Link
          to="/support"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === "/support"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">Support</span>
        </Link>

        {/* User card */}
        {role && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50 mt-2">
            <Avatar className="w-8 h-8 shrink-0 ring-1 ring-primary/20">
              <AvatarImage
                src={(user?.user_metadata?.avatar_url as string) || ""}
                alt={
                  (user?.user_metadata?.full_name as string) ||
                  user?.email?.split("@")[0] ||
                  "User"
                }
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {(
                  (user?.user_metadata?.full_name as string) ||
                  user?.email?.split("@")[0] ||
                  "U"
                )
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5">
                {roleLabel[role]}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar-background border border-sidebar-border text-sidebar-foreground"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-sidebar-background border-r border-sidebar-border transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-64 shrink-0 bg-sidebar-background border-r border-sidebar-border h-screen sticky top-0",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
