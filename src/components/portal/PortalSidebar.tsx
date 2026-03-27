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
  Building2,
  Briefcase,
  MessageSquare,
  FolderOpen,
  UserCircle,
  HelpCircle,
  Globe,
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
    label: "Global Gateway",
    href: "/global-gateway",
    icon: Globe,
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

const roleDot: Record<Role, string> = {
  admin:   "bg-destructive",
  manager: "bg-primary",
  analyst: "bg-success",
  viewer:  "bg-muted-foreground",
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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_hsl(var(--electric-cyan)/0.2)]">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-bold leading-tight">
          <span className="text-gradient-primary">GEM</span>
          <span className="text-sidebar-foreground/60 ml-1">Portal</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        <p className="section-label">Navigation</p>
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-l-2 border-transparent pl-[10px]"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "")} />
              <span className="flex-1">{item.label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </Link>
          );
        })}

        <p className="section-label mt-3">Account</p>
        <Link
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border-l-2",
            location.pathname === "/profile"
              ? "bg-primary/10 text-primary border-primary pl-[10px]"
              : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-transparent pl-[10px]"
          )}
        >
          <UserCircle className={cn("w-4 h-4 shrink-0", location.pathname === "/profile" ? "text-primary" : "")} />
          <span className="flex-1">Profile</span>
          {location.pathname === "/profile" && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
        </Link>
        <Link
          to="/support"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border-l-2",
            location.pathname === "/support"
              ? "bg-primary/10 text-primary border-primary pl-[10px]"
              : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-transparent pl-[10px]"
          )}
        >
          <HelpCircle className={cn("w-4 h-4 shrink-0", location.pathname === "/support" ? "text-primary" : "")} />
          <span className="flex-1">Support</span>
          {location.pathname === "/support" && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
        </Link>
      </nav>

      {/* User Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-sidebar-border space-y-2">
        {role && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent/40 border border-sidebar-border/60">
            <Avatar className="w-8 h-8 shrink-0 ring-2 ring-primary/25 ring-offset-1 ring-offset-sidebar">
              <AvatarImage
                src={(user?.user_metadata?.avatar_url as string) || ""}
                alt={
                  (user?.user_metadata?.full_name as string) ||
                  user?.email?.split("@")[0] ||
                  "User"
                }
              />
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
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
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {user?.email}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", roleDot[role])} />
                <p className="text-xs text-sidebar-foreground/50">{roleLabel[role]}</p>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar-background border border-sidebar-border text-sidebar-foreground shadow-lg"
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
          "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-sidebar-background border-r border-sidebar-border transform transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-64 shrink-0 bg-sidebar-background border-r border-sidebar-border h-screen sticky top-0",
          className
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
