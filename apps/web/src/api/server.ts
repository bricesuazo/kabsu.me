import { auth as getAuth } from "@clerk/nextjs/app-beta";
import superjson from "superjson";

import { createTRPCNextLayout } from "~/@trpc/next-layout/server";
import "server-only";
import { appRouter, createInnerTRPCContext } from "@cvsudotme/api";

export const api = createTRPCNextLayout({
  router: appRouter,
  transformer: superjson,
  createContext() {
    const auth = getAuth();
    return createInnerTRPCContext({
      auth,
    });
  },
});
