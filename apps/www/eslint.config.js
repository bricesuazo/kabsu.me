import baseConfig, { restrictEnvAccess } from "@kabsu.me/eslint-config/base";
import nextjsConfig from "@kabsu.me/eslint-config/nextjs";
import reactConfig from "@kabsu.me/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
