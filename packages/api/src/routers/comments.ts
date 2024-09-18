import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const commentsRouter = router({
  getFullComment: protectedProcedure
    .input(z.object({ comment_id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { data: full_comment } = await ctx.supabase
        .from("comments")
        .select(
          "id, content, user_id, created_at, users(name, username, image_name, verified_at), likes:comments_likes(user_id), replies:comments(id, thread_id, deleted_at)",
        )
        .eq("id", input.comment_id)
        .is("deleted_at", null)
        .is("comments.deleted_at", null)
        .single();

      if (!full_comment) return null;

      let image_url: string | null = null;
      if (
        full_comment.users?.image_name &&
        !full_comment.users.image_name.startsWith("https://")
      ) {
        const { data } = ctx.supabase.storage
          .from("avatars")
          .getPublicUrl(
            "users/" +
              full_comment.user_id +
              "/" +
              full_comment.users.image_name,
          );

        image_url = data.publicUrl;
      }

      return {
        comment: {
          ...full_comment,
          replies: full_comment.replies as unknown as {
            id: string;
            thread_id: string | null;
            deleted_at: string | null;
          }[],
          users: full_comment.users?.image_name?.startsWith("https://")
            ? {
                ...full_comment.users,
                image_url: full_comment.users.image_name,
              }
            : full_comment.users?.image_name && image_url
              ? { ...full_comment.users, image_url }
              : { ...full_comment.users, image_name: null },
        },
        userId: ctx.auth.user.id,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        post_id: z.string().min(1),
        content: z.string().trim().min(1, { message: "Comment cannot be empty." }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: post } = await ctx.supabase
        .from("posts")
        .select()
        .eq("id", input.post_id)
        .single();

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      const { error } = await ctx.supabase.from("comments").insert({
        user_id: ctx.auth.user.id,
        post_id: input.post_id,
        content: input.content,
      });

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });

      if (post.user_id !== ctx.auth.user.id) {
        const { data: new_notification } = await ctx.supabase
          .from("notifications")
          .insert({
            to_id: post.user_id,
            type: "comment",
            from_id: ctx.auth.user.id,
            content_id: input.post_id,
          })
          .select(
            "id, from:users!public_notifications_from_id_fkey(username), to:users!public_notifications_to_id_fkey(username)",
          )
          .single();

        if (new_notification?.from?.username && new_notification.to?.username) {
          const channel = ctx.supabase.channel("notifications." + post.user_id);
          await channel.send({
            type: "broadcast",
            event: "comment",
            payload: {
              notification_id: new_notification.id,
              from: new_notification.from.username,
              to: new_notification.to.username,
              post_id: input.post_id,
            },
          });
          await ctx.supabase.removeChannel(channel);
        }
      }
    }),
  delete: protectedProcedure
    .input(z.object({ comment_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data: comment } = await ctx.supabase
        .from("comments")
        .select()
        .eq("id", input.comment_id)
        .eq("user_id", ctx.auth.user.id)
        .single();

      if (!comment)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });

      if (comment.user_id !== ctx.auth.user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const { error } = await ctx.supabase
        .from("comments")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", input.comment_id)
        .eq("user_id", ctx.auth.user.id);

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
        .select()
        .eq("id", input.comment_id)
        .single();

      if (!comment || comment.deleted_at)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });

      if (comment.user_id === ctx.auth.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to report this comment",
        });

      await ctx.supabase.from("reported_comments").insert({
        reason: input.reason,
        reported_by_id: ctx.auth.user.id,
        comment_id: input.comment_id,
      });
    }),
  like: protectedProcedure
    .input(z.object({ comment_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data: is_liked } = await ctx.supabase
        .from("comments_likes")
        .select()
        .eq("comment_id", input.comment_id)
        .eq("user_id", ctx.auth.user.id)
        .single();

      if (is_liked)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already liked this comment",
        });

      const { error } = await ctx.supabase.from("comments_likes").insert({
        user_id: ctx.auth.user.id,
        comment_id: input.comment_id,
      });

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
    }),
  unlike: protectedProcedure
    .input(z.object({ comment_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("comments_likes")
        .delete()
        .eq("comment_id", input.comment_id)
        .eq("user_id", ctx.auth.user.id);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
    }),
  reply: protectedProcedure
    .input(
      z.object({
        comment_id: z.string().min(1),
        content: z.string().trim().min(1, { message: "Reply cannot be empty." }),
        post_id: z.string().min(1),
        level: z.number().int().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: comment } = await ctx.supabase
        .from("comments")
        .select()
        .eq("id", input.comment_id)
        .single();

      if (!comment)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });

      const { data, error } = await ctx.supabase
        .from("comments")
        .insert({
          user_id: ctx.auth.user.id,
          thread_id: input.level === 0 ? input.comment_id : comment.thread_id,
          content: input.content,
          post_id: input.post_id,
        })
        .select("post:posts(user:users(username))")
        .single();

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });

      if (comment.user_id !== ctx.auth.user.id) {
        const { data: new_notification } = await ctx.supabase
          .from("notifications")
          .insert({
            to_id: comment.user_id,
            type: "reply",
            from_id: ctx.auth.user.id,
            content_id: input.post_id,
          })
          .select(
            "id, from:users!public_notifications_from_id_fkey(username), to:users!public_notifications_to_id_fkey(username)",
          )
          .single();

        if (new_notification?.from?.username && new_notification.to?.username) {
          const channel = ctx.supabase.channel(
            "notifications." + comment.user_id,
          );
          await channel.send({
            type: "broadcast",
            event: "reply",
            payload: {
              notification_id: new_notification.id,
              from: new_notification.from.username,
              to: new_notification.to.username,
              post_user_username: data.post?.user?.username,
              post_id: input.post_id,
              comment_id: input.comment_id,
            },
          });
          await ctx.supabase.removeChannel(channel);
        }
      }
    }),
});
