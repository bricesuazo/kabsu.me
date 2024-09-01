import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const authRouter = router({
  getCurrentSession: publicProcedure.query(({ ctx }) => ctx.auth),
  getMyUsername: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("username")
      .eq("id", ctx.auth.user.id)
      .single();

    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });

    return user.username;
  }),
  isMyNGLDisplayed: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("is_ngl_displayed")
      .eq("id", ctx.auth.user.id)
      .single();

    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });

    return user.is_ngl_displayed;
  }),
  toggleIsMyNGLDisplayed: protectedProcedure
    .input(
      z.object({
        is_ngl_displayed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("users")
        .update({ is_ngl_displayed: input.is_ngl_displayed })
        .eq("id", ctx.auth.user.id);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });

      return input.is_ngl_displayed;
    }),
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("*")
      .eq("id", ctx.auth.user.id)
      .single();

    if (!user)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });

    let image_url: string | null = null;
    if (user.image_name && !user.image_name.startsWith("https://")) {
      const { data } = ctx.supabase.storage
        .from("avatars")
        .getPublicUrl("users/" + user.id + "/" + user.image_name);
      image_url = data.publicUrl;
    }
    return user.image_name?.startsWith("https://")
      ? {
          ...user,
          image_url: user.image_name,
        }
      : user.image_name && image_url
        ? { ...user, image_url }
        : { ...user, image_name: null };
  }),
  getCurrentUserPublic: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.auth) return null;

    const { data: user } = await ctx.supabase
      .from("users")
      .select("*")
      .eq("id", ctx.auth.user.id)
      .single();

    return user;
  }),
  getMyUniversityStatus: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.auth) return null;

    const { data: user } = await ctx.supabase
      .from("users")
      .select(
        "programs(id, name, slug, colleges(id, name, slug, campuses(id, name, slug)))",
      )
      .eq("id", ctx.auth.user.id)
      .single();

    return user;
  }),
});
