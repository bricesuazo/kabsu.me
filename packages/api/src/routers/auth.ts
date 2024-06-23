import { TRPCError } from "@trpc/server";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const authRouter = router({
  getCurrentSession: publicProcedure.query(({ ctx }) => ctx.auth),
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("*")
      .eq("id", ctx.auth.session.user.id)
      .single();

    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });

    let image_url: string | null = null;
    if (user.image_path) {
      const { data } = await ctx.supabase.storage
        .from("users")
        .createSignedUrl(user.id + "/" + user.image_path, 60 * 60 * 24);
      if (data) {
        image_url = data.signedUrl;
      }
    }
    return user.image_path && image_url
      ? { ...user, image_url }
      : { ...user, image_path: null };
  }),
  getCurrentUserPublic: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.auth) return null;

    const { data: user } = await ctx.supabase
      .from("users")
      .select("*")
      .eq("id", ctx.auth.session.user.id)
      .single();

    return user;
  }),
});
