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
          "id, read, type, content_id, created_at, from_id, from:users!public_notifications_from_id_fkey(username, image_name)",
        )
        .eq("to_id", ctx.auth.user.id)
        .eq("trash", false)
        .order("created_at", { ascending: false })
        .limit(input.all ? Infinity : 8);

      if (notifications === null)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notifications not found",
        });

      const posts_to_fetch = notifications
        .filter((notification) => notification.type !== "follow")
        .map((notification) => notification.content_id);

      const { data: posts } = await ctx.supabase
        .from("posts")
        .select("*")
        .in("id", posts_to_fetch);

      if (posts === null)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Posts not found",
        });

      const image_urls: {
        error: string | null;
        path: string | null;
        signedUrl: string;
      }[] = [];
      const { data } = await ctx.supabase.storage
        .from("users")
        .createSignedUrls(
          notifications
            .filter(
              (notif) =>
                notif.from !== null &&
                !notif.from.image_name?.startsWith("https://"),
            )
            .map((notif) => notif.from_id + "/" + notif.from?.image_name),
          60 * 60 * 24,
        );
      if (data) {
        image_urls.push(...data);
      }

      return notifications.map((notification) => {
        const signed_url = image_urls.find(
          (url) =>
            url.path ===
            notification.from_id + "/" + notification.from?.image_name,
        );
        return {
          ...notification,
          content: posts.find((post) => post.id === notification.content_id),
          from: notification.from?.image_name?.startsWith("https://")
            ? { ...notification.from, image_url: notification.from.image_name }
            : notification.from?.image_name && signed_url
              ? { ...notification.from, image_url: signed_url.signedUrl }
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
