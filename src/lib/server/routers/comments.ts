import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { comments, notifications } from "@/lib/db/schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
export const commentsRouter = router({
  getFullComment: protectedProcedure
    .input(z.object({ comment_id: z.string().nonempty() }))

    .query(async ({ ctx, input }) => {
      const fullComment = await ctx.db.query.comments.findFirst({
        where: (comment, { eq }) => eq(comment.id, input.comment_id),
        with: {
          user: true,
        },
      });

      if (!fullComment) return null;

      const user = await ctx.clerk.users.getUser(fullComment.user_id);

      return {
        comment: {
          ...fullComment,
          user,
        },
        userId: ctx.session.user.id,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        post_id: z.string().nonempty(),
        content: z.string().nonempty({ message: "Comment cannot be empty." }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, input.post_id),
      });

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      await ctx.db.insert(comments).values({
        user_id: ctx.session.user.id,
        post_id: input.post_id,
        content: input.content,
      });

      if (post.user_id !== ctx.session.user.id) {
        await ctx.db.insert(notifications).values({
          to_id: post.user_id,
          type: "comment",
          from_id: ctx.session.user.id,
          link: input.post_id,
        });
      }
    }),
  delete: protectedProcedure
    .input(z.object({ comment_id: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.comments.findFirst({
        where: (comments, { and, eq }) =>
          and(
            eq(comments.id, input.comment_id),
            eq(comments.user_id, ctx.session.user.id),
          ),
      });

      if (!comment)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });

      if (comment.user_id !== ctx.session.user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      await ctx.db
        .update(comments)
        .set({ deleted_at: new Date() })
        .where(
          and(
            eq(comments.id, input.comment_id),
            eq(comments.user_id, ctx.session.user.id),
          ),
        );
    }),
});
