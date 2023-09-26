import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@cvsu.me/api/root";
import { createTRPCContext } from "@cvsu.me/api/trpc";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;
// export const fetchCache = "only-no-store";
// export const runtime = "edge";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
