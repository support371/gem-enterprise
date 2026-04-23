export type PlatformNavIcon =
  | "LayoutDashboard"
  | "Package"
  | "Briefcase"
  | "FileText"
  | "ClipboardList"
  | "HeadphonesIcon"
  | "MessageSquare"
  | "Bell"
  | "ShieldCheck"
  | "User"
  | "Settings"
  | "Lock"
  | "Shield"
  | "Users"
  | "CheckCircle"
  | "PieChart"
  | "UserCheck"
  | "Wallet"
  | "PiggyBank";

export interface PlatformSurface {
  id: "marketing-mobile" | "enterprise-web-app";
  label: string;
  kind: "public" | "authenticated";
  defaultPath: string;
  preserveBrandPreview: boolean;
  notes: string;
}

export interface PlatformNavItem {
  href: string;
  icon: PlatformNavIcon;
  label: string;
  description: string;
}

export interface PlatformNavGroup {
  label: string;
  items: PlatformNavItem[];
}

export const platformSurfaces: PlatformSurface[] = [
  {
    id: "marketing-mobile",
    label: "Mobile Platform Surface",
    kind: "public",
    defaultPath: "/",
    preserveBrandPreview: true,
    notes:
      "Mobile-first industrial presentation shell for discovery, preview, onboarding, and public service navigation.",
  },
  {
    id: "enterprise-web-app",
    label: "Enterprise Web App",
    kind: "authenticated",
    defaultPath: "/app/dashboard",
    preserveBrandPreview: true,
    notes:
      "Full service workspace shell for authenticated client and admin operations.",
  },
];

export const platformBrandContract = {
  name: "GEM Enterprise",
  backgroundClass: "bg-background",
  previewMode: "preserve",
  primaryAccentHsl: "185 100% 45%",
  shellIntent:
    "Maintain the current dark industrial brand system while allowing the web app shell to be restructured without removing service tabs.",
};

export const clientPortalNavGroups: PlatformNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/app/dashboard",
        icon: "LayoutDashboard",
        label: "Dashboard",
        description: "Client overview, status, and operational summary.",
      },
      {
        href: "/app/portfolios",
        icon: "Briefcase",
        label: "Portfolios",
        description: "Portfolio views, allocations, and reporting.",
      },
      {
        href: "/app/my-portfolio",
        icon: "Wallet",
        label: "My Portfolio",
        description: "Personalized holdings and position-level summary.",
      },
      {
        href: "/app/savings-vault",
        icon: "PiggyBank",
        label: "Savings Vault",
        description: "Protected savings and yield products.",
      },
      {
        href: "/app/products",
        icon: "Package",
        label: "Products",
        description: "Available products and gated service offerings.",
      },
      {
        href: "/app/profiles",
        icon: "UserCheck",
        label: "Profiles",
        description: "Identity, access, and operating profiles.",
      },
    ],
  },
  {
    label: "Portal",
    items: [
      {
        href: "/app/services",
        icon: "Package",
        label: "Services",
        description: "Operational service catalog and workflows.",
      },
      {
        href: "/app/community",
        icon: "Users",
        label: "Community",
        description: "Member and relationship surface inside the portal.",
      },
      {
        href: "/app/workspace",
        icon: "MessageSquare",
        label: "Workspace",
        description: "Execution workspace and collaboration view.",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        href: "/app/documents",
        icon: "FileText",
        label: "Documents",
        description: "Statements, agreements, and document vault.",
      },
      {
        href: "/app/requests",
        icon: "ClipboardList",
        label: "Requests",
        description: "Service requests, submissions, and tracking.",
      },
      {
        href: "/app/messages",
        icon: "MessageSquare",
        label: "Messages",
        description: "Secure messaging and conversation threads.",
      },
      {
        href: "/app/notifications",
        icon: "Bell",
        label: "Notifications",
        description: "Alerts, updates, and operational notices.",
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        href: "/app/support",
        icon: "HeadphonesIcon",
        label: "Support",
        description: "Support operations and concierge channels.",
      },
      {
        href: "/app/compliance",
        icon: "ShieldCheck",
        label: "Compliance",
        description: "Compliance review, disclosures, and acknowledgements.",
      },
      {
        href: "/app/profile",
        icon: "User",
        label: "Profile",
        description: "Profile and client identity management.",
      },
      {
        href: "/app/settings",
        icon: "Settings",
        label: "Settings",
        description: "Preferences, account options, and controls.",
      },
      {
        href: "/app/security",
        icon: "Lock",
        label: "Security",
        description: "Security posture, password, and access controls.",
      },
    ],
  },
];

export const adminPortalNavItems: PlatformNavItem[] = [
  {
    href: "/app/admin",
    icon: "Shield",
    label: "Admin Center",
    description: "Administrative overview and controls.",
  },
  {
    href: "/app/admin/kyc",
    icon: "CheckCircle",
    label: "KYC Queue",
    description: "KYC review queue and decisioning.",
  },
  {
    href: "/app/admin/approvals",
    icon: "ClipboardList",
    label: "Approvals",
    description: "Operational approvals and manual reviews.",
  },
  {
    href: "/app/admin/users",
    icon: "Users",
    label: "Users",
    description: "User management and role administration.",
  },
  {
    href: "/app/admin/allocations",
    icon: "PieChart",
    label: "Allocations",
    description: "Allocation, entitlement, and portfolio administration.",
  },
];
