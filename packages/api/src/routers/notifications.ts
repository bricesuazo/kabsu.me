import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { notifications } from "@cvsu.me/db/schema";
import { and, eq } from "drizzle-orm";

export const notificationsRouter = router({
  getAll: protectedProcedure
    .input(z.object({ all: z.boolean().default(false) }))
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.db.query.notifications.findMany({
        where: (notification, { eq }) =>
          eq(notification.to_id, ctx.session.user.id),
        orderBy: (notification, { desc }) => desc(notification.created_at),
        limit: !input.all ? 8 : undefined,
      });

      const users = await ctx.clerk.users.getUserList({
        userId: notifications.map((notification) => notification.from_id),
      });

      return notifications.map((notification) => ({
        ...notification,
        from: users.find((user) => user.id === notification.from_id)!,
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
