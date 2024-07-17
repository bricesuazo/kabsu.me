import { cache } from "react";
import { headers } from "next/headers";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

import type { AppRouter } from "@kabsu.me/api/root";
import { createTRPCContext } from "@kabsu.me/api";
import { createCaller } from "@kabsu.me/api/root";

import { createClient as createClientServer } from "~/supabase/server";
import { createQueryClient } from "./query-client";

const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  const supabase = createClientServer();
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
