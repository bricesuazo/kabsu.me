import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@cvsu.me/api/root";

export const api = createTRPCReact<AppRouter>({});
