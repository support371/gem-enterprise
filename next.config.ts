import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  // Packages that must run in Node.js (not bundled into the edge runtime)
  serverExternalPackages: ["bcryptjs", "nodemailer", "@prisma/client", "prisma"],

  // Canonical route redirects — legacy route normalization
  async redirects() {
    return [
      { source: "/home",                destination: "/",                        permanent: true },
      { source: "/intelligence",        destination: "/intel",                   permanent: true },
      { source: "/contact-us",          destination: "/contact",                 permanent: true },
      { source: "/about-us",            destination: "/about",                   permanent: true },
      { source: "/architecture",        destination: "/intel#architecture",      permanent: true },
      { source: "/specs",               destination: "/intel#architecture",      permanent: true },
      { source: "/trust-center",        destination: "/compliance-notice",       permanent: true },
      { source: "/solutions",           destination: "/services",                permanent: true },
      { source: "/solutions/:slug",     destination: "/services",                permanent: true },
      { source: "/pricing",             destination: "/get-started",             permanent: true },
      { source: "/blog",                destination: "/resources",               permanent: true },
      { source: "/blog/:slug",          destination: "/resources",               permanent: true },
      { source: "/login",               destination: "/client-login",            permanent: true },
      { source: "/dashboard",           destination: "/app/dashboard",           permanent: true },
      { source: "/portal/:path*",       destination: "/app/:path*",              permanent: true },
      // Root-level portal shortcuts — accessible from external links and support docs
      { source: "/profile",             destination: "/app/profile",             permanent: false },
      { source: "/settings",            destination: "/app/settings",            permanent: false },
      { source: "/support",             destination: "/app/support",             permanent: false },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Immutable static assets — Vercel CDN caches these at the edge
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Short-lived cache for API responses
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600,
  },

  experimental: {
    // Tree-shake large libraries at build time — major bundle-size win on Vercel
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "recharts",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-sheet",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
    ],
  },
};

export default nextConfig;
