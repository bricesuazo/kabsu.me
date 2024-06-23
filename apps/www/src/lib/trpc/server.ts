import { cookies, headers } from "next/headers";
import { loggerLink } from "@trpc/client";
import { experimental_nextCacheLink as nextCacheLink } from "@trpc/next/app-dir/links/nextCache";
import { experimental_createTRPCNextAppDirServer as createTRPCNextAppDirServer } from "@trpc/next/app-dir/server";
// import { experimental_nextHttpLink as nextHttpLink } from "@trpc/next/app-dir/links/nextHttp";
import superjson from "superjson";

import { appRouter } from "@kabsu.me/api/root";

import { createClient as createClientAdmin } from "~/supabase/admin";
import { createClient as createClientServer } from "~/supabase/server";
import { endingLink } from "./utils";

/**
 * This client invokes procedures directly on the server without fetching over HTTP.
 */
export const api = createTRPCNextAppDirServer<typeof appRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: () => true,
        }),
        endingLink({
          headers: Object.fromEntries(headers().entries()),
        }),
        nextCacheLink({
          revalidate: false,
          router: appRouter,
          async createContext() {
            const supabase = createClientServer();
            const {
              data: { session },
            } = await supabase.auth.getSession();
            return {
              auth: session ? { session } : null,
              supabase: createClientAdmin(),
              headers: {
                cookie: cookies().toString(),
                "x-trpc-source": "rsc-invoke",
              },
            };
          },
        }),
      ],
    };
  },
});
