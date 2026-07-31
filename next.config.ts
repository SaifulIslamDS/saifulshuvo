import type { NextConfig } from "next";

const supabaseOrigin = (() => {
  try { return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "https://*.supabase.co"; }
  catch { return "https://*.supabase.co"; }
})();

const scriptEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${scriptEval} https://www.googletagmanager.com https://plausible.io`,
  `connect-src 'self' ${supabaseOrigin} wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://plausible.io`,
  "manifest-src 'self'",
  "media-src 'self' https:",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverActions: { bodySizeLimit: "11mb" },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/auth/:path*", headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
