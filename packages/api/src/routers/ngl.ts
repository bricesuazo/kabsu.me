import { TRPCError } from "@trpc/server";
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
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id, name, username, image_name, is_ngl_displayed")
        .eq("username", input.username)
        .is("banned_at", null)
        .is("deactivated_at", null)
        .single();

      if (!user) return null;

      let image_url: string | null = null;
      if (user.image_name && !user.image_name.startsWith("https://")) {
        const { data } = await ctx.supabase.storage
          .from("users")
          .createSignedUrl(
            user.id + "/avatar/" + user.image_name,
            60 * 60 * 24,
          );
        if (data) {
          image_url = data.signedUrl;
        }
      }

      return user.image_name?.startsWith("https://")
        ? { ...user, image_url: user.image_name }
        : user.image_name && image_url
          ? { ...user, image_url }
          : { ...user, image_name: null };
    }),
  sendMessage: publicProcedure
    .input(
      z.object({
        content: z.string(),
        code_name: z.string().optional(),
        user_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error: error_message } = await ctx.supabase
        .from("ngl_questions")
        .insert({
          user_id: input.user_id,
          content: input.content,
          code_name: input.code_name,
        });

      if (error_message)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
    }),
  getAllMessages: publicProcedure
    .input(
      z.object({
        user_id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data: messages, error: error_messages } = await ctx.supabase
        .from("ngl_questions")
        .select(
          "id, content, code_name, created_at, answers:ngl_answers(id, content, created_at)",
        )
        .eq("user_id", input.user_id)
        .order("created_at", { ascending: false });

      if (error_messages)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get messages",
        });

      return messages.filter((message) => message.answers.length !== 0);
    }),
});
