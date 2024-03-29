// import { update } from "@kabsu.me/auth";
import { BLOCKED_USERNAMES } from "@kabsu.me/constants";
import {
  ACCOUNT_TYPE,
  followees,
  followers,
  notifications,
  reported_problems,
  reported_users,
  suggested_features,
  users,
} from "@kabsu.me/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const usersRouter = router({
  signUp: protectedProcedure
    .input(
      z.object({
        program_id: z.string(),
        type: z.enum(ACCOUNT_TYPE),
        name: z.string().nonempty(),
        username: z.string().nonempty(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (trx) => {
        await trx
          .update(users)
          .set({
            program_id: input.program_id,
            type: input.type,
            name: input.name,
            username: input.username,
          })
          .where(eq(users.id, ctx.session.user.id));

        // await update({
        //   user: {
        //     program_id: input.program_id,
        //     type: input.type,
        //     name: input.name,
        //     username: input.username,
        //   },
        // });
      });
      return { isSuccess: true, ...input } || { isSuccess: false };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        bio: z
          .string()
          .max(128, { message: "Bio must be less than 128 characters" })
          .nullable(),
        link: z
          .string()
          .max(64, { message: "Link must be less than 64 characters" })
          .nullable(),
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

      if (ctx.session.user.id !== input.user_id) {
        await ctx.db.insert(notifications).values({
          from_id: ctx.session.user.id,
          to_id: input.user_id,
          type: "follow",
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

      const user = await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.username, input.username),
      });

      return !!user;
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
      const user = await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.username, input.username),
      });

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
            : !!followers.find(
                (follower) => follower.follower_id === ctx.session.user.id,
              ),
      };
    }),
  report: protectedProcedure
    .input(z.object({ user_id: z.string().min(1), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { and, eq }) => and(eq(users.id, input.user_id)),
      });

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (user.id === ctx.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to report this user",
        });

      await ctx.db.insert(reported_users).values({
        reason: input.reason,
        reported_by_id: ctx.session.user.id,
        user_id: input.user_id,
      });
    }),
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: optimize this
      const users = await ctx.db.query.users.findMany({
        where: (user, { isNotNull }) => isNotNull(user.username),
      });

      return users
        .filter(
          (user) =>
            user.name.toLowerCase().includes(input.query.toLowerCase()) ||
            user.username?.toLowerCase().includes(input.query.toLowerCase()),
        )
        .map((user) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          imageUrl:
            typeof user.image === "string"
              ? user.image
              : user.image?.url ?? null,
          isVerified: !!user.verified_at,
        }))
        .slice(0, 10);
    }),
  getTotalUsers: publicProcedure.query(
    async ({ ctx }) => (await ctx.db.query.users.findMany()).length,
  ),
  reportAProblem: protectedProcedure
    .input(
      z.object({
        content: z.string().nonempty(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(reported_problems).values({
        problem: input.content,
        reported_by_id: ctx.session.user.id,
      });
    }),
  suggestAFeature: protectedProcedure
    .input(
      z.object({
        content: z.string().nonempty(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(suggested_features).values({
        feature: input.content,
        suggested_by_id: ctx.session.user.id,
      });
    }),
  updateAccountSettings: protectedProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        username: z.string().nonempty(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (trx) => {
        if (ctx.session.user.username !== input.username) {
          if (BLOCKED_USERNAMES.has(input.username))
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Username is not allowed",
            });

          const user = await ctx.db.query.users.findFirst({
            where: (user, { eq }) => eq(user.username, input.username),
          });

          if (user)
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Username is already taken",
            });
        }

        await trx
          .update(users)
          .set({
            name: input.name,
            username: input.username,
          })
          .where(eq(users.id, ctx.session.user.id));
      });

      return input;
    }),
  updateProfilePicture: protectedProcedure
    .input(z.object({ image: z.string() }))
    .mutation(({ input }) => {
      const base64 = input.image;
      // await ctx.db.transaction(async (trx) => {
      const byteCharsArray = Array.from(
        atob(base64.substr(base64.indexOf(",") + 1)),
      );
      const chunksIterator = new Array(Math.ceil(byteCharsArray.length / 512));
      const bytesArrays = [];

      for (let c = 0; c < chunksIterator.length; c++) {
        bytesArrays.push(
          new Uint8Array(
            byteCharsArray
              .slice(c * 512, 512 * (c + 1))
              .map((s) => s.charCodeAt(0)),
          ),
        );
      }

      // const file = new Blob(bytesArrays, { type: "image/png" });

      // const user = await ctx.clerk.users.updateUserProfileImage(
      //   ctx.session.user.id,
      //   {
      //     file,
      //   },
      // );

      //   await trx
      //     .update(users)
      //     .set({ profile_picture_url: user.imageUrl })
      //     .where(eq(users.id, ctx.session.user.id));
      // });
    }),
});
