import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@kabsu.me/api/root";

export const api = createTRPCReact<AppRouter>();
