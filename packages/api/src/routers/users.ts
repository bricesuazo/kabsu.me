import { TRPCError } from "@trpc/server";
import { addMonths, isAfter } from "date-fns";
import { z } from "zod";

import type { Database } from "@kabsu.me/supabase/types";
import { BLOCKED_USERNAMES } from "@kabsu.me/constants";

import { env } from "../env";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const usersRouter = router({
  contact: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: "Name is required" }),
        email: z
          .string()
          .min(1, { message: "Email is required" })
          .email("Enter a valid email"),
        message: z
          .string()
          .min(1, { message: "Message is required" })
          .max(500, "Message cannot be more than 500 characters"),
      }),
    )
    .mutation(async ({ input }) => {
      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Kabsu.me",
          avatar_url: "https://example.com/avatar.png",
          embeds: [
            {
              title: `Contact form submission - ${env.ENV.toUpperCase()}`,
              description: `You have received a new message from the contact form.`,
              color: 0x00ff00,
              fields: [
                { name: "👤  Name:", value: input.name, inline: true },
                { name: "📧  Email:", value: input.email, inline: true },
                { name: "📝  Message", value: `"${input.message}"` },
              ],
              footer: { text: "Received" },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    }),

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
        .eq("id", ctx.auth.user.id)
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
          id: ctx.auth.user.id,
          email: ctx.auth.user.email ?? "",
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
        image_name: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select()
        .eq("id", ctx.auth.user.id)
        .single();

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      if (
        ((user.image_name && input.image_name === null) ||
          (input.image_name &&
            user.image_name &&
            input.image_name !== user.image_name)) &&
        !user.image_name.startsWith("https")
      ) {
        await ctx.supabase.storage
          .from("avatars")
          .remove(["users/" + user.id + "/" + user.image_name]);
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
        .eq("id", ctx.auth.user.id);

      return { username: input.username };
    }),

  follow: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: is_already_following } = await ctx.supabase
        .from("followers")
        .select("*")
        .eq("follower_id", ctx.auth.user.id)
        .eq("followee_id", input.user_id)
        .single();

      if (is_already_following)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Already following user",
        });

      await Promise.all([
        ctx.supabase.from("followers").insert({
          follower_id: ctx.auth.user.id,
          followee_id: input.user_id,
        }),
        ctx.supabase.from("followees").insert({
          follower_id: input.user_id,
          followee_id: ctx.auth.user.id,
        }),
      ]);

      if (ctx.auth.user.id !== input.user_id) {
        const { data: new_notification } = await ctx.supabase
          .from("notifications")
          .insert({
            from_id: ctx.auth.user.id,
            to_id: input.user_id,
            type: "follow",
          })
          .select("id, from:users!public_notifications_from_id_fkey(username)")
          .single();

        if (new_notification?.from.username) {
          const channel = ctx.supabase.channel(
            "notifications." + input.user_id,
          );
          await channel.send({
            type: "broadcast",
            event: "follow",
            payload: {
              notification_id: new_notification.id,
              from: new_notification.from.username,
            },
          });
          await ctx.supabase.removeChannel(channel);
        }
      }
    }),
  unfollow: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all([
        ctx.supabase
          .from("followers")
          .delete()
          .eq("follower_id", ctx.auth.user.id)
          .eq("followee_id", input.user_id),
        ctx.supabase
          .from("followees")
          .delete()
          .eq("follower_id", input.user_id)
          .eq("followee_id", ctx.auth.user.id),
      ]);

      if (ctx.auth.user.id !== input.user_id) {
        await ctx.supabase
          .from("notifications")
          .delete()
          .eq("to_id", input.user_id)
          .eq("from_id", ctx.auth.user.id)
          .eq("type", "follow");

        const channel = ctx.supabase.channel("notifications." + input.user_id);
        await channel.send({
          type: "broadcast",
          event: "unfollow",
          payload: {},
        });
        await ctx.supabase.removeChannel(channel);
      }
    }),

  getProgramForAuth: publicProcedure.query(async ({ ctx }) => {
    const [{ data: campuses }, { data: colleges }, { data: programs }] =
      await Promise.all([
        ctx.supabase.from("campuses").select("id, name, slug"),
        ctx.supabase.from("colleges").select("id, name, slug, campus_id"),
        ctx.supabase.from("programs").select("id, name, slug, college_id"),
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
  getUserImageUploadSignedUrl: protectedProcedure
    .input(z.object({ image_name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data } = await ctx.supabase.storage
        .from("avatars")
        .createSignedUploadUrl(
          "users/" + ctx.auth.user.id + "/" + input.image_name,
        );
      if (!data) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return data;
    }),
  isFollower: protectedProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: is_follower } = await ctx.supabase
        .from("followers")
        .select()
        .eq("follower_id", ctx.auth.user.id)
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
          "id, name, username, image_name, type, bio, link, verified_at, deactivated_at, banned_at, program:programs!inner(name, slug, college_id, college:colleges!inner(name, slug, campus_id, campus:campuses!inner(name, slug)))",
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
      if (
        user_from_db.image_name &&
        !user_from_db.image_name.startsWith("https")
      ) {
        const { data } = ctx.supabase.storage
          .from("avatars")
          .getPublicUrl(
            "users/" + user_from_db.id + "/" + user_from_db.image_name,
          );
        image_url = data.publicUrl;
      }

      return {
        followersLength: followers?.length ?? 0,
        followeesLength: followees?.length ?? 0,
        user_id: ctx.auth.user.id,
        user: {
          is_deactivated: !!user_from_db.deactivated_at,
          is_banned: !!user_from_db.banned_at,
          ...(user_from_db.image_name?.startsWith("https://")
            ? {
                ...user_from_db,
                image_url: user_from_db.image_name,
              }
            : user_from_db.image_name && image_url
              ? {
                  ...user_from_db,
                  image_url,
                }
              : {
                  ...user_from_db,
                  image_name: null,
                }),
        },
        is_follower: !!followers?.some(
          (follower) => follower.follower_id === ctx.auth.user.id,
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

      if (user.id === ctx.auth.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to report this user",
        });

      await ctx.supabase.from("reported_users").insert({
        reason: input.reason,
        reported_by_id: ctx.auth.user.id,
        user_id: input.user_id,
      });
    }),
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: users } = await ctx.supabase
        .from("users")
        .select("*, programs(colleges(campuses(*)))")
        .not("id", "eq", ctx.auth.user.id)
        .is("banned_at", null)
        .is("deactivated_at", null)
        .ilike("username", `%${input.query}%`);

      if (users === null) return [];

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

          let image_url: string | null = null;
          if (user.image_name && !user.image_name.startsWith("https://")) {
            const { data } = ctx.supabase.storage
              .from("avatars")
              .getPublicUrl("users/" + user.id + "/" + user.image_name);

            image_url = data.publicUrl;
          }
          return user.image_name?.startsWith("https://")
            ? {
                ...base,
                image_name: user.image_name,
                image_url: user.image_name,
              }
            : user.image_name && image_url
              ? {
                  ...base,
                  image_name: user.image_name,
                  image_url,
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
        content: z.string().min(1, { message: "Content is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      const { data: user, error } = await ctx.supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();

      if (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const username = user.username;
      const userEmail = ctx.auth.user.email;

      await ctx.supabase.from("reported_problems").insert({
        problem: input.content,
        reported_by_id: userId,
        reported_by_email: userEmail,
      });

      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Kabsu.me",
          avatar_url: "https://example.com/avatar.png",
          embeds: [
            {
              title: `Problem Report - ${env.ENV.toUpperCase()}`,
              description: `A new problem has been reported.`,
              color: 0xff0000,
              fields: [
                {
                  name: "👤 User Info",
                  value: `**name**: ${username}  **email**: ${userEmail}`,
                  inline: false,
                },
                {
                  name: "📝 Problem",
                  value: `"${input.content}"`,
                  inline: false,
                },
              ],
              footer: { text: "Reported" },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    }),

  suggestAFeature: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1, { message: "Content is required" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      const { data: user, error } = await ctx.supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();

      if (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const username = user.username;
      const userEmail = ctx.auth.user.email;

      await ctx.supabase.from("suggested_features").insert({
        feature: input.content,
        suggested_by_id: ctx.auth.user.id,
        suggested_by_email: userEmail,
      });

      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Kabsu.me",
          avatar_url: "https://example.com/avatar.png",
          embeds: [
            {
              title: `Feature Suggestion - ${env.ENV.toUpperCase()}`,
              description: `A new feature has been suggested.`,
              color: 0x0000ff,
              fields: [
                {
                  name: "👤 User Info",
                  value: `**name**: ${username}  **email**: ${userEmail}`,
                },
                {
                  name: "📝 Problem",
                  value: `"${input.content}"`,
                  inline: false,
                },
              ],
              footer: { text: "Suggested" },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
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
        .eq("id", ctx.auth.user.id)
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
        .eq("id", ctx.auth.user.id);

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
          .eq("followee_id", ctx.auth.user.id),
      ]);

      if (!followees || !my_followers)
        throw new TRPCError({ code: "NOT_FOUND" });

      const followeesUsers =
        followees.length !== 0
          ? await ctx.supabase
              .from("users")
              .select("id, username, name, bio, image_name")
              .in(
                "id",
                followees.map((f) => f.follower_id),
              )
              .then((res) => {
                if (res.error) {
                  console.error(res.error);
                  return [];
                }

                return res.data.map((user) => {
                  let image_url: string | null = null;

                  if (
                    user.image_name &&
                    !user.image_name.startsWith("https://")
                  ) {
                    const { data } = ctx.supabase.storage
                      .from("avatars")
                      .getPublicUrl("users/" + user.id + "/" + user.image_name);
                    image_url = data.publicUrl;
                  }

                  return user.image_name?.startsWith("https://")
                    ? {
                        ...user,
                        image_url: user.image_name,
                      }
                    : user.image_name && image_url
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
          .eq("followee_id", ctx.auth.user.id),
      ]);

      if (!followers || !my_followees)
        throw new TRPCError({ code: "NOT_FOUND" });

      const followersUsers =
        followers.length !== 0
          ? await ctx.supabase
              .from("users")
              .select("id, username, name, bio, image_name")
              .in(
                "id",
                followers.map((f) => f.follower_id),
              )
              .then((res) => {
                if (res.error) {
                  console.error(res.error);
                  return [];
                }

                return res.data.map((user) => {
                  let image_url: string | null = null;

                  if (
                    user.image_name &&
                    !user.image_name.startsWith("https://")
                  ) {
                    const { data } = ctx.supabase.storage
                      .from("avatars")
                      .getPublicUrl("users/" + user.id + "/" + user.image_name);
                    image_url = data.publicUrl;
                  }
                  return user.image_name?.startsWith("https://")
                    ? {
                        ...user,
                        image_url: user.image_name,
                      }
                    : user.image_name && image_url
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

  getCurrentUserTypeProgram: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("type, program_id, program_changed_at")
      .eq("id", ctx.auth.user.id)
      .single();

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    return user;
  }),
  changeCurrentUserTypeProgram: protectedProcedure
    .input(
      z.object({
        type: z.custom<Database["public"]["Enums"]["user_type"]>(),
        program_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("type, program_id, program_changed_at")
        .eq("id", ctx.auth.user.id)
        .single();

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      if (
        user.program_changed_at !== null &&
        !isAfter(new Date(), addMonths(new Date(user.program_changed_at), 3))
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only change your role and program every 3 months.",
        });

      if (!(input.type === user.type && input.program_id === user.program_id))
        await ctx.supabase
          .from("users")
          .update({
            type: input.type,
            program_id: input.program_id,
            program_changed_at: new Date().toISOString(),
          })
          .eq("id", ctx.auth.user.id);
      else
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No changes",
        });
    }),
  getToMentionUsers: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: users } = await ctx.supabase
        .from("users")
        .select("*")
        .not("id", "eq", ctx.auth.user.id)
        .ilike("username", `%${input.name}%`)
        .limit(5);

      if (users === null) return [];

      return users
        .filter(
          (user) =>
            user.name.toLowerCase().includes(input.name.toLowerCase()) ||
            user.username.toLowerCase().includes(input.name.toLowerCase()),
        )
        .map((user) => {
          const base = {
            id: user.id,
            username: user.username,
            name: user.name,
            is_verified: !!user.verified_at,
          };

          let image_url: string | null = null;
          if (user.image_name && !user.image_name.startsWith("https://")) {
            const { data } = ctx.supabase.storage
              .from("avatars")
              .getPublicUrl("users/" + user.id + "/" + user.image_name);
            image_url = data.publicUrl;
          }
          return user.image_name?.startsWith("https://")
            ? {
                ...base,
                image_name: user.image_name,
                image_url: user.image_name,
              }
            : user.image_name && image_url
              ? {
                  ...base,
                  image_name: user.image_name,
                  image_url,
                }
              : {
                  ...base,
                  image_name: null,
                };
        })
        .slice(0, 10);
    }),
  getAllMyReportedProblems: protectedProcedure.query(async ({ ctx }) => {
    const { data: reported_problems } = await ctx.supabase
      .from("reported_problems")
      .select("id, problem, created_at")
      .eq("reported_by_id", ctx.auth.user.id)
      .order("created_at", { ascending: false });

    return reported_problems ?? [];
  }),
  getAllMySuggestedFeatures: protectedProcedure.query(async ({ ctx }) => {
    const { data: suggested_features } = await ctx.supabase
      .from("suggested_features")
      .select("id, feature, created_at")
      .eq("suggested_by_id", ctx.auth.user.id)
      .order("created_at", { ascending: false });

    return suggested_features ?? [];
  }),
  getMyStrikes: protectedProcedure.query(async ({ ctx }) => {
    const { data: strikes } = await ctx.supabase
      .from("strikes")
      .select("id, reason, created_at")
      .eq("user_id", ctx.auth.user.id)
      .order("created_at", { ascending: true });

    return strikes ?? [];
  }),
  deactivate: protectedProcedure
    .input(
      z.object({
        username: z.string().min(1, {
          message: "Username must be at least 1 character.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.supabase
        .from("users")
        .select("username, deactivated_at")
        .eq("id", ctx.auth.user.id)
        .single();

      if (user?.deactivated_at) throw new TRPCError({ code: "BAD_REQUEST" });

      if (user?.username !== input.username)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username does not match",
        });

      await ctx.supabase
        .from("users")
        .update({ deactivated_at: new Date().toISOString() })
        .eq("id", ctx.auth.user.id);
    }),
  reactivate: protectedProcedure.mutation(async ({ ctx }) => {
    const { data: user } = await ctx.supabase
      .from("users")
      .select("deactivated_at")
      .eq("id", ctx.auth.user.id)
      .single();

    if (!user?.deactivated_at) throw new TRPCError({ code: "NOT_FOUND" });

    await ctx.supabase
      .from("users")
      .update({ deactivated_at: null })
      .eq("id", ctx.auth.user.id);
  }),
});
