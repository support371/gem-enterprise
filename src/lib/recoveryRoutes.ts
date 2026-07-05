import type { SiteRoute } from "@/lib/siteRoutes";

export const recoveryRoutes: SiteRoute[] = [
  {
    path: "/forgot-password",
    label: "Forgot Password",
    category: "auth",
    description: "Request a time-limited password reset link",
    isPublic: true,
    isCanonical: true,
    menuGroup: "none",
    owner: "auth",
    showInNav: false,
    showInFooter: false,
  },
  {
    path: "/reset-password",
    label: "Reset Password",
    category: "auth",
    description: "Complete password recovery using a signed reset token",
    isPublic: true,
    isCanonical: true,
    menuGroup: "none",
    owner: "auth",
    showInNav: false,
    showInFooter: false,
  },
];
