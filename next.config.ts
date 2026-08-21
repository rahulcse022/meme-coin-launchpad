import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Blocking metadata avoids Next.js wrapping tags in a hidden <div> that
  // password/antivirus extensions stamp with attributes like bis_skin_checked.
  htmlLimitedBots: /.*/,
  experimental: {
    useOffline: true,
  },
  allowedDevOrigins: ["http://localhost:3000", "http://[IP_ADDRESS]", "https://meme-coin-launchpad.vercel.app"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
