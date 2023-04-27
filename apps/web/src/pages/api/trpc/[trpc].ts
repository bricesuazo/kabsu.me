import { type NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createInnerTRPCContext } from "@cvsudotme/api";

import { env } from "~/env.mjs";

export default function handler(req: NextRequest) {
  return fetchRequestHandler({
    req,
    endpoint: "/api/trpc",
    router: appRouter,
    createContext() {
      const auth = getAuth(req);
      return createInnerTRPCContext({
        auth,
      });
    },
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });
}

export const runtime = "edge";

// import { createNextApiHandler } from "@trpc/server/adapters/next";

// import { appRouter, createTRPCContext } from "@cvsudotme/api";

// // export API handler
// export default createNextApiHandler({
//   router: appRouter,
//   createContext: createTRPCContext,
// });
