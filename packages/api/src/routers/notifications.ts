import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const notificationsRouter = router({
  getAll: protectedProcedure
    .input(z.object({ all: z.boolean().default(false) }))
    .query(async ({ ctx, input }) => {
      const { data: notifications } = await ctx.supabase
        .from("notifications")
        .select(
          "id, read, type, content_id, ngl_question_id, created_at, from_id, from:users!public_notifications_from_id_fkey(username, image_name), to:users!public_notifications_to_id_fkey(username, image_name)",
        )
        .eq("to_id", ctx.auth.user.id)
        .eq("trash", false)
        .order("created_at", { ascending: false })
        // .is("ngl_questions.deleted_at", null)
        .limit(input.all ? Infinity : 8);
      console.log("🚀 ~ .query ~ notifications:", notifications);

      if (notifications === null)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notifications not found",
        });

      const posts_to_fetch = notifications
        .filter(
          (notification) =>
            !(notification.type === "follow" || notification.type === "ngl"),
        )
        .map((notification) => notification.content_id);

      const { data: posts } = await ctx.supabase
        .from("posts")
        .select("*, user:users(username)")
        .in("id", posts_to_fetch);

      if (posts === null)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Posts not found",
        });

      return notifications.map((notification) => {
        let image_url: string | null = null;

        if (
          notification.from?.image_name &&
          !notification.from.image_name.startsWith("https:")
        ) {
          const { data } = ctx.supabase.storage
            .from("avatars")
            .getPublicUrl(
              "users/" +
                notification.from_id +
                "/" +
                notification.from.image_name,
            );

          image_url = data.publicUrl;
        }
        return {
          ...notification,
          content: posts.find((post) => post.id === notification.content_id),
          from: notification.from?.image_name?.startsWith("https://")
            ? { ...notification.from, image_url: notification.from.image_name }
            : notification.from?.image_name && image_url
              ? { ...notification.from, image_url }
              : {
                  ...notification.from,
                  image_name: null,
                },
        };
      });
    }),
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.supabase
      .from("notifications")
      .update({ read: true })
      .eq("to_id", ctx.auth.user.id);
  }),
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", input.id)
        .eq("to_id", ctx.auth.user.id);
    }),
});
