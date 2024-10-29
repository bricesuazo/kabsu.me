import type { Config } from "tailwindcss";

import baseConfig from "@kabsu.me/tailwind-config/web";

export default {
  content: [...baseConfig.content, "@kabsu.me/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
