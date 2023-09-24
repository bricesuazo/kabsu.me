import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { notifications } from "@cvsu.me/db/schema";

import { protectedProcedure, router } from "../trpc";

export const notificationsRouter = router({
  getAll: protectedProcedure
    .input(z.object({ all: z.boolean().default(false) }))
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.db.query.notifications.findMany({
        where: (notification, { eq, and, not }) =>
          and(
            eq(notification.to_id, ctx.session.user.id),
            not(notification.trash),
          ),
        orderBy: (notification, { desc }) => desc(notification.created_at),
        limit: !input.all ? 8 : undefined,
      });

      const postsToFetch = notifications
        .filter((notification) => notification.type !== "follow")
        .map((notification) => notification.content_id!);

      const posts = await ctx.db.query.posts.findMany({
        where: (post, { inArray }) =>
          inArray(post.id, !postsToFetch.length ? [""] : postsToFetch),
      });

      const users = await ctx.clerk.users.getUserList({
        userId: [
          ...new Set([
            ...notifications.map((notification) => notification.from_id),
          ]),
        ],
      });

      return notifications.map((notification) => ({
        ...notification,
        from: users.find((user) => user.id === notification.from_id)!,
        content: posts.find((post) => post.id === notification.content_id)!,
      }));
    }),
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.to_id, ctx.session.user.id));
  }),
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.to_id, ctx.session.user.id),
            eq(notifications.id, input.id),
          ),
        );
    }),
});
