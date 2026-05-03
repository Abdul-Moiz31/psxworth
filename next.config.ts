import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", // Your local development origin
        "t618dvt9-3000.inc1.devtunnels.ms", // The devtunnels.ms host
        "wajahatgul.com",
        "www.wajahatgul.com",
        // Add any other domains where your app will be deployed/accessed
      ],
      // For older Next.js versions, you might need `allowedForwardedHosts`
      // allowedForwardedHosts: ['t618dvt9-3000.inc1.devtunnels.ms'],
    },
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  productionBrowserSourceMaps: true,
  output: "standalone",
};

//export default nextConfig;

//To enable sourcemaps on posthog..
export default withPostHogConfig(nextConfig, {
  personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY ?? "", // Personal API Key
  envId: process.env.POSTHOG_ENV_ID ?? "", // Environment ID
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST, // (optional), defaults to https://us.posthog.com
  sourcemaps: {
    // (optional)
    enabled: true, // (optional) Enable sourcemaps generation and upload, default to true on production builds
    deleteAfterUpload: true, // (optional) Delete sourcemaps after upload, defaults to true
  },
});
