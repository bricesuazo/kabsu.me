import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { initTRPC, TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";
import superjson from "superjson";
import { ZodError } from "zod";

import type { Database } from "./../../../supabase/types";
import { env } from "./../../../apps/www/src/env";

export const createTRPCContext = (opts: {
  headers: Headers;
  auth: { user: User } | null;
}) => {
  const auth = opts.auth;
  const source = opts.headers.get("x-trpc-source") ?? "unknown";

  console.log(">>> tRPC Request from", source, "by", auth?.user.email);

  const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  return {
    supabase,
    redis,
    ...opts,
  };
};

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
  if (!ctx.auth) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      auth: {
        ...ctx.auth,
      },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

export const adminProcedure = t.procedure
  .use(enforceUserIsAuthed)
  .use(({ ctx, next }) => {
    if (ctx.auth.user.email !== env.NEXT_PUBLIC_SUPERADMIN_EMAIL) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({ ctx });
  });
export const createCallerFactory = t.createCallerFactory;
