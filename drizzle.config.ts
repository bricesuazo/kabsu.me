import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import { env } from "@/lib/env.mjs";

dotenv.config({
  path: ".env",
});

export default {
  schema: "./src/db/schema/index.ts",
  driver: "mysql2",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
} satisfies Config;
