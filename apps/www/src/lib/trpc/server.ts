import { cache } from "react";
import { headers } from "next/headers";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

import type { AppRouter } from "@kabsu.me/api";
import { createCaller, createTRPCContext } from "@kabsu.me/api";
import { createClient as createClientServer } from "@kabsu.me/supabase/client/server";

import { createQueryClient } from "./query-client";

const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return createTRPCContext({
    auth: user ? { user } : null,
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
