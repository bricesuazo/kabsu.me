import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import {
  ACCOUNT_TYPE,
  followees,
  followers,
  notifications,
  users,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { BLOCKED_USERNAMES } from "@/lib/constants";
export const usersRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        program_id: z.string(),
        type: z.enum(ACCOUNT_TYPE),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const usersFromDB = await ctx.db.query.users.findMany();
      await ctx.db.insert(users).values({
        id: input.userId,
        program_id: input.program_id,
        type: input.type,
        user_number: usersFromDB.length,
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        bio: z
          .string()
          .max(128, { message: "Bio must be less than 128 characters" }),
        link: z
          .string()
          .max(64, { message: "Link must be less than 64 characters" })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ bio: input.bio, link: input.link })
        .where(eq(users.id, ctx.session.user.id));
    }),

  follow: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const isAlreadyFollowing = await ctx.db.query.followers.findFirst({
        where: (follower, { and, eq }) =>
          and(
            eq(follower.follower_id, ctx.session.user.id),
            eq(follower.followee_id, input.user_id),
          ),
      });

      if (isAlreadyFollowing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already following user",
        });

      await ctx.db.insert(followers).values({
        follower_id: ctx.session.user.id,
        followee_id: input.user_id,
      });

      await ctx.db.insert(followees).values({
        follower_id: input.user_id,
        followee_id: ctx.session.user.id,
      });

      const user = await ctx.clerk.users.getUser(ctx.session.user.id);

      if (ctx.session.user.id !== input.user_id) {
        await ctx.db.insert(notifications).values({
          to_id: input.user_id,
          type: "follow",
          from_id: ctx.session.user.id,
          link: user.username ?? "",
        });
      }
    }),

  unfollow: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(followers)
        .where(
          and(
            eq(followers.follower_id, ctx.session.user.id),
            eq(followers.followee_id, input.user_id),
          ),
        );

      await ctx.db
        .delete(followees)
        .where(
          and(
            eq(followees.follower_id, input.user_id),
            eq(followees.followee_id, ctx.session.user.id),
          ),
        );

      if (ctx.session.user.id !== input.user_id) {
        await ctx.db
          .delete(notifications)
          .where(
            and(
              eq(notifications.to_id, input.user_id),
              eq(notifications.from_id, ctx.session.user.id),
              eq(notifications.type, "follow"),
            ),
          );
      }
    }),

  getProgramForAuth: publicProcedure.query(async ({ ctx }) => {
    const campuses = await ctx.db.query.campuses.findMany();
    const colleges = await ctx.db.query.colleges.findMany();
    const programs = await ctx.db.query.programs.findMany();

    return {
      campuses,
      colleges,
      programs,
    };
  }),

  isUsernameExists: publicProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (BLOCKED_USERNAMES.has(input.username)) return true;

      const users = await ctx.clerk.users.getUserList({
        username: [input.username],
      });

      const user = users[0];

      return !!user || users.length > 0;
    }),

  isFollower: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const isFollower = await ctx.db.query.followers.findFirst({
        where: (follower, { and, eq }) =>
          and(
            eq(follower.follower_id, ctx.session.user.id),
            eq(follower.followee_id, input.user_id),
          ),
      });

      return !!isFollower;
    }),

  getUserProfile: protectedProcedure
    .input(z.object({ username: z.string().nonempty() }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.clerk.users.getUserList({
        username: [input.username],
      });

      const user = users[0];

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const userFromDB = await ctx.db.query.users.findFirst({
        where: (userDB, { eq }) => eq(userDB.id, user.id),

        with: {
          program: { with: { college: { with: { campus: true } } } },
        },
      });

      if (!userFromDB) throw new TRPCError({ code: "NOT_FOUND" });

      const followers = await ctx.db.query.followers.findMany({
        where: (follower, { eq }) => eq(follower.followee_id, userFromDB.id),
      });

      const followees = await ctx.db.query.followees.findMany({
        where: (followee, { eq }) => eq(followee.followee_id, userFromDB.id),
      });

      return {
        followersLength: followers.length,
        followeesLength: followees.length,
        user: {
          ...user,
          ...userFromDB,
        },
        userId: ctx.session.user.id,
        isFollower:
          user.id === ctx.session.user.id
            ? undefined
            : !!(await ctx.db.query.followers.findFirst({
                where: (follower, { eq }) =>
                  eq(follower.follower_id, ctx.session.user.id),
              })),
      };
    }),
});
