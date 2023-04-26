import { auth as getAuth } from "@clerk/nextjs/app-beta";
import superjson from "superjson";

import { appRouter, createInnerTRPCContext } from "@cvsudotme/api";

// import "server-only";

import { createTRPCNextLayout } from "~/@trpc/next-layout/server";

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
