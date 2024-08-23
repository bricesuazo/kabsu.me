import baseConfig from "@kabsu.me/eslint-config/base";
import reactConfig from "@kabsu.me/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
