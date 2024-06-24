import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { BLOCKED_USERNAMES } from "@kabsu.me/constants";

import type { Database } from "../../../../supabase/types";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const usersRouter = router({
  signUp: protectedProcedure
    .input(
      z.object({
        program_id: z.string(),
        type: z.custom<Database["public"]["Enums"]["user_type"]>(),
        name: z.string().min(1),
        username: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select()
        .eq("id", ctx.auth.session.user.id)
        .single();

      if (user) {
        await ctx.supabase
          .from("users")
          .update({
            program_id: input.program_id,
            type: input.type,
            name: input.name,
            username: input.username,
          })
          .eq("id", user.id);
      } else {
        await ctx.supabase.from("users").insert({
          id: ctx.auth.session.user.id,
          email: ctx.auth.session.user.email ?? "",
          program_id: input.program_id,
          type: input.type,
          name: input.name,
          username: input.username,
        });
      }

      return { success: true, ...input };
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
        name: z.string().max(64),
        username: z.string().max(64),
        image_name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select()
        .eq("id", ctx.auth.session.user.id)
        .single();

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      if (user.image_name !== input.image_name) {
        await ctx.supabase.storage
          .from("users")
          .remove([user.id + "/avatar/" + user.image_name]);
      }

      await ctx.supabase
        .from("users")
        .update({
          name: input.name,
          username: input.username,
          bio: input.bio,
          link: input.link,
          image_name: input.image_name,
        })
        .eq("id", ctx.auth.session.user.id);

      return { username: input.username };
    }),

  follow: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: is_already_following } = await ctx.supabase
        .from("followers")
        .select("*")
        .eq("follower_id", ctx.auth.session.user.id)
        .eq("followee_id", input.user_id)
        .single();

      if (is_already_following)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already following user",
        });

      await ctx.supabase.from("followers").insert({
        follower_id: ctx.auth.session.user.id,
        followee_id: input.user_id,
      });

      await ctx.supabase.from("followees").insert({
        follower_id: input.user_id,
        followee_id: ctx.auth.session.user.id,
      });

      if (ctx.auth.session.user.id !== input.user_id) {
        await ctx.supabase.from("notifications").insert({
          from_id: ctx.auth.session.user.id,
          to_id: input.user_id,
          type: "follow",
        });
      }
    }),

  unfollow: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("followers")
        .delete()
        .eq("follower_id", ctx.auth.session.user.id)
        .eq("followee_id", input.user_id);

      await ctx.supabase
        .from("followees")
        .delete()
        .eq("follower_id", input.user_id)
        .eq("followee_id", ctx.auth.session.user.id);

      if (ctx.auth.session.user.id !== input.user_id) {
        await ctx.supabase
          .from("notifications")
          .delete()
          .eq("to_id", input.user_id)
          .eq("from_id", ctx.auth.session.user.id)
          .eq("type", "follow");
      }
    }),

  getProgramForAuth: publicProcedure.query(async ({ ctx }) => {
    const [{ data: programs }, { data: colleges }, { data: campuses }] =
      await Promise.all([
        ctx.supabase.from("programs").select(),
        ctx.supabase.from("colleges").select(),
        ctx.supabase.from("campuses").select(),
      ]);

    if (programs === null || colleges === null || campuses === null)
      throw new TRPCError({ code: "NOT_FOUND" });

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

      const { data: user } = await ctx.supabase
        .from("users")
        .select()
        .eq("username", input.username)
        .single();

      return !!user;
    }),

  isFollower: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: is_follower } = await ctx.supabase
        .from("followers")
        .select()
        .eq("follower_id", ctx.auth.session.user.id)
        .eq("followee_id", input.user_id)
        .single();

      return !!is_follower;
    }),

  getUserProfile: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { data: user_from_db } = await ctx.supabase
        .from("users")
        .select(
          "*, programs(name, slug, colleges(name, slug, campuses(name, slug)))",
        )
        .eq("username", input.username)
        .single();

      if (!user_from_db) throw new TRPCError({ code: "NOT_FOUND" });

      const { data: followers } = await ctx.supabase
        .from("followers")
        .select()
        .eq("followee_id", user_from_db.id);

      const { data: followees } = await ctx.supabase
        .from("followees")
        .select()
        .eq("followee_id", user_from_db.id);

      let image_url: string | null = null;
      if (user_from_db.image_name) {
        const { data } = await ctx.supabase.storage
          .from("users")
          .createSignedUrl(
            user_from_db.id + "/avatar/" + user_from_db.image_name,
            60,
          );
        if (data) {
          image_url = data.signedUrl;
        }
      }

      return {
        followersLength: followers?.length ?? 0,
        followeesLength: followees?.length ?? 0,
        user_id: ctx.auth.session.user.id,
        user:
          user_from_db.image_name && image_url
            ? {
                ...user_from_db,
                image_url,
              }
            : {
                ...user_from_db,
                image_name: null,
              },
        is_follower: !!followers?.some(
          (follower) => follower.follower_id === ctx.auth.session.user.id,
        ),
      };
    }),
  report: protectedProcedure
    .input(z.object({ user_id: z.string().min(1), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select()
        .eq("id", input.user_id)
        .single();

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (user.id === ctx.auth.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to report this user",
        });

      await ctx.supabase.from("reported_users").insert({
        reason: input.reason,
        reported_by_id: ctx.auth.session.user.id,
        user_id: input.user_id,
      });
    }),
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: users } = await ctx.supabase
        .from("users")
        .select("*, programs(colleges(campuses(*)))")
        .not("id", "eq", ctx.auth.session.user.id)
        .ilike("username", `%${input.query}%`);

      if (users === null) return [];

      const image_urls: {
        error: string | null;
        path: string | null;
        signedUrl: string;
      }[] = [];
      const { data } = await ctx.supabase.storage
        .from("users")
        .createSignedUrls(
          users.map((user) => user.id + "/" + user.image_name),
          60 * 60 * 24,
        );
      if (data) {
        image_urls.push(...data);
      }

      return users
        .filter(
          (user) =>
            user.name.toLowerCase().includes(input.query.toLowerCase()) ||
            user.username.toLowerCase().includes(input.query.toLowerCase()),
        )
        .map((user) => {
          const base = {
            id: user.id,
            username: user.username,
            name: user.name,
            is_verified: !!user.verified_at,
          };
          const signedUrl = image_urls.find(
            (image) => image.path === user.id + "/" + user.image_name,
          )?.signedUrl;
          return user.image_name && signedUrl
            ? {
                ...base,
                image_name: user.image_name,
                image_url: signedUrl,
              }
            : {
                ...base,
                image_name: null,
              };
        })
        .slice(0, 10);
    }),
  getTotalUsers: publicProcedure.query(async ({ ctx }) => {
    const { count } = await ctx.supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    return count ?? 0;
  }),
  reportAProblem: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase.from("reported_problems").insert({
        problem: input.content,
        reported_by_id: ctx.auth.session.user.id,
      });
    }),
  suggestAFeature: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase.from("suggested_features").insert({
        feature: input.content,
        suggested_by_id: ctx.auth.session.user.id,
      });
    }),
  updateAccountSettings: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        username: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: add transaction
      const { data: user } = await ctx.supabase
        .from("users")
        .select()
        .eq("id", ctx.auth.session.user.id)
        .single();

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      if (user.username !== input.username) {
        if (BLOCKED_USERNAMES.has(input.username))
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Username is not allowed",
          });
      }

      await ctx.supabase
        .from("users")
        .update({
          name: input.name,
          username: input.username,
        })
        .eq("id", ctx.auth.session.user.id);

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
      //   ctx.auth.session.user.id,
      //   {
      //     file,
      //   },
      // );

      //   await trx
      //     .update(users)
      //     .set({ profile_picture_url: user.imageUrl })
      //     .where(eq(users.id, ctx.auth.session.user.id));
      // });
    }),
  getAllFollowings: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("username", input.username)
        .single();

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const [{ data: followees }, { data: my_followers }] = await Promise.all([
        ctx.supabase
          .from("followees")
          .select("follower_id, created_at")
          .eq("followee_id", user.id)
          .order("created_at", { ascending: true }),
        ctx.supabase
          .from("followers")
          .select("follower_id")
          .eq("followee_id", ctx.auth.session.user.id),
      ]);

      if (!followees || !my_followers)
        throw new TRPCError({ code: "NOT_FOUND" });

      const followeesUsers =
        followees.length !== 0
          ? await ctx.supabase
              .from("users")
              .select()
              .in(
                "id",
                followees.map((f) => f.follower_id),
              )
              .then(async (res) => {
                if (res.error) {
                  console.error(res.error);
                  return [];
                }

                const image_urls: {
                  error: string | null;
                  path: string | null;
                  signedUrl: string;
                }[] = [];

                const { data } = await ctx.supabase.storage
                  .from("users")
                  .createSignedUrls(
                    res.data.map((user) => user.id + "/" + user.image_name),
                    60 * 60 * 24,
                  );
                if (data) {
                  image_urls.push(...data);
                }

                return res.data.map((user) => {
                  const image_url = image_urls.find(
                    (image) => image.path === user.id + "/" + user.image_name,
                  )?.signedUrl;
                  return user.image_name && image_url
                    ? {
                        ...user,
                        image_url,
                      }
                    : { ...user, image_name: null };
                });
              })
          : [];

      return { followeesUsers, followees, my_followers };
    }),
  getAllFollowers: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("id")
        .eq("username", input.username)
        .single();

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const [{ data: followers }, { data: my_followees }] = await Promise.all([
        ctx.supabase
          .from("followers")
          .select("follower_id, created_at")
          .eq("followee_id", user.id)
          .order("created_at", { ascending: true }),
        ctx.supabase
          .from("followees")
          .select("follower_id")
          .eq("followee_id", ctx.auth.session.user.id),
      ]);

      if (!followers || !my_followees)
        throw new TRPCError({ code: "NOT_FOUND" });

      const followersUsers =
        followers.length !== 0
          ? await ctx.supabase
              .from("users")
              .select()
              .in(
                "id",
                followers.map((f) => f.follower_id),
              )
              .then(async (res) => {
                if (res.error) {
                  console.error(res.error);
                  return [];
                }

                const image_urls: {
                  error: string | null;
                  path: string | null;
                  signedUrl: string;
                }[] = [];

                const { data } = await ctx.supabase.storage
                  .from("users")
                  .createSignedUrls(
                    res.data.map((user) => user.id + "/" + user.image_name),
                    60 * 60 * 24,
                  );
                if (data) {
                  image_urls.push(...data);
                }

                return res.data.map((user) => {
                  const image_url = image_urls.find(
                    (image) => image.path === user.id + "/" + user.image_name,
                  )?.signedUrl;
                  return user.image_name && image_url
                    ? {
                        ...user,
                        image_url,
                      }
                    : { ...user, image_name: null };
                });
              })
          : [];

      return { followersUsers, followers, my_followees };
    }),
});
