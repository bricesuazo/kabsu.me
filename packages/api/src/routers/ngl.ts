import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const nglRouter = router({
  getUser: publicProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from("users")
        .select()
        .eq("username", input.username)
        .eq("id", ctx.auth?.user.id ?? "")
        .single();

      return data;
    }),
});
