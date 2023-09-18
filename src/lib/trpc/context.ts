import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getUserAuth } from "../auth/utils";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export async function createContext(opts?: FetchCreateContextFnOptions) {
  const { session } = await getUserAuth();

  return {
    session,
    db,
    clerk: clerkClient,
    headers: opts && Object.fromEntries(opts.req.headers),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
