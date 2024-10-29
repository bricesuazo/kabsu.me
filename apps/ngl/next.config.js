import { fileURLToPath } from "url";
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
    "@kabsu.me/constants",
    "@kabsu.me/ui",
  ],
};

export default config;
