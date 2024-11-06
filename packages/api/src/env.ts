import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

export const env = createEnv({
  extends: [vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    ENV: z
      .enum(["development", "staging", "production"])
      .default("development"),
    NEXT_PUBLIC_SUPERADMIN_EMAIL: z.string().email(),
  },
  server: {
    DISCORD_WEBHOOK_URL: z.string().url(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    SENTRY_AUTH_TOKEN: z.string(),
    SENTRY_ORG: z.string(),
    SENTRY_PROJECT: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SUPERADMIN_EMAIL: process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL,
    NODE_ENV: undefined,
    ENV: process.env.ENV,
  },
  skipValidation:
    !!process.env.CI ||
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
