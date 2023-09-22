import { auth, clerkClient } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "@cvsu.me/db";

export async function createTRPCContext(opts?: FetchCreateContextFnOptions) {
  const { userId } = auth();

  let session: {
    user: {
      id: string;
      name?: string;
      email?: string;
    };
  } | null = null;

  if (userId) {
    session = {
      user: {
        id: userId,
      },
    };
  } else {
    session = null;
  }

  return {
    session,
    db,
    clerk: clerkClient,
    headers: opts && Object.fromEntries(opts.req.headers),
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: {
        ...ctx.session,
      },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
