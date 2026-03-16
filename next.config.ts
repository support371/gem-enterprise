import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  // Canonical route redirects — legacy route normalization
  async redirects() {
    return [
      // Legacy route aliases
      { source: "/home", destination: "/", permanent: true },
      { source: "/intelligence", destination: "/intel", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/architecture", destination: "/intel#architecture", permanent: true },
      { source: "/specs", destination: "/intel#architecture", permanent: true },
      { source: "/trust-center", destination: "/compliance-notice", permanent: true },
      { source: "/solutions", destination: "/services", permanent: true },
      { source: "/solutions/:slug", destination: "/services", permanent: true },
      { source: "/pricing", destination: "/get-started", permanent: true },
      { source: "/blog", destination: "/resources", permanent: true },
      { source: "/blog/:slug", destination: "/resources", permanent: true },
      { source: "/login", destination: "/client-login", permanent: true },
      { source: "/dashboard", destination: "/app/dashboard", permanent: true },
      { source: "/portal/:path*", destination: "/app/:path*", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
