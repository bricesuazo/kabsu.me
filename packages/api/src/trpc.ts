import type { Session } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { Database } from "./../../../supabase/types";
import { env } from "./../../../apps/www/src/env";

interface CreateContextOptions {
  auth: {
    session: Session;
    // user: Database["public"]["Tables"]["users"]["Row"];
  } | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
  return {
    supabase,
    ...opts,
  };
};

export const createTRPCContext = (opts: {
  req?: Request;
  auth: CreateContextOptions["auth"];
}) => {
  const auth = opts.auth;
  const source = opts.req?.headers.get("x-trpc-source") ?? "unknown";

  console.log(">>> tRPC Request from", source, "by", auth?.session.user.email);

  return createInnerTRPCContext({
    auth,
  });
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
