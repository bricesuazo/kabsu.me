import { fileURLToPath } from "url";
import { withSentryConfig } from "@sentry/nextjs";
import { createJiti } from "jiti";

await createJiti(fileURLToPath(import.meta.url)).import("./src/env");

/** @type {import('next').NextConfig} */
const config = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
      },
      {
        protocol: "https",
        hostname: "yqzqvzfpaiptblzdkphp.supabase.co",
      },
      {
        protocol: "https",
        hostname: "mcquriygnthreskhulbh.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  transpilePackages: [
    "@kabsu.me/api",
    "@kabsu.me/supabase",
    "@kabsu.me/contants",
    "@kabsu.me/ui",
  ],
};

export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true, // Can be used to suppress logs
});
