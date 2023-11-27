import type { AppRouter } from "@kabsu.me/api/root";
import { createTRPCReact } from "@trpc/react-query";

export const api = createTRPCReact<AppRouter>({});
