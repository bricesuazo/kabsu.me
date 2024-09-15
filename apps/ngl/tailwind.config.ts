import type { Config } from "tailwindcss";

import baseConfig from "@kabsu.me/tailwind-config/web";

export default {
  content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      colors: {
        "primary-ngl": "#23C45E",
        "secondary-ngl": "#72C20F",
      },
    },
  },
} satisfies Config;
