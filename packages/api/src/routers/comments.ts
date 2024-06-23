import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const commentsRouter = router({
  getFullComment: protectedProcedure
    .input(z.object({ comment_id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { data: full_comment } = await ctx.supabase
        .from("comments")
        .select("*, users(*)")
        .eq("id", input.comment_id)
        .single();

      if (!full_comment) return null;

      let image_url: string | null = null;
      if (full_comment.users?.image_path) {
        const { data } = await ctx.supabase.storage
          .from("users")
          .createSignedUrl(
            full_comment.users.id + "/" + full_comment.users.image_path,
            60,
          );

        if (data) image_url = data.signedUrl;
      }

      return {
        comment: {
          ...full_comment,
          users:
            full_comment.users?.image_path && image_url
              ? { ...full_comment.users, image_url }
              : { ...full_comment.users, image_path: null },
        },
        userId: ctx.auth.session.user.id,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        post_id: z.string().min(1),
        content: z.string().min(1, { message: "Comment cannot be empty." }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: post } = await ctx.supabase
        .from("posts")
        .select("*")
        .eq("id", input.post_id)
        .single();

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      const { error } = await ctx.supabase.from("comments").insert({
        user_id: ctx.auth.session.user.id,
        post_id: input.post_id,
        content: input.content,
      });

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });

      if (post.user_id !== ctx.auth.session.user.id) {
        await ctx.supabase.from("notifications").insert({
          to_id: post.user_id,
          type: "comment",
          from_id: ctx.auth.session.user.id,
          content_id: input.post_id,
        });
      }
    }),
  delete: protectedProcedure
    .input(z.object({ comment_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data: comment } = await ctx.supabase
        .from("comments")
        .select("*")
        .eq("id", input.comment_id)
        .eq("user_id", ctx.auth.session.user.id)
        .single();

      if (!comment)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });

      if (comment.user_id !== ctx.auth.session.user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const { error } = await ctx.supabase
        .from("comments")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", input.comment_id)
        .eq("user_id", ctx.auth.session.user.id);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
    }),
  report: protectedProcedure
    .input(z.object({ comment_id: z.string().min(1), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: comment } = await ctx.supabase
        .from("comments")
        .select("*")
        .eq("id", input.comment_id)
        .single();

      if (!comment || comment.deleted_at)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });

      if (comment.user_id === ctx.auth.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to report this comment",
        });

      await ctx.supabase.from("reported_comments").insert({
        reason: input.reason,
        reported_by_id: ctx.auth.session.user.id,
        comment_id: input.comment_id,
      });
    }),
});
