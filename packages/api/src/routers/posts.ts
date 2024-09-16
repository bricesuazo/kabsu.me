import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import type { Database } from "../../../../supabase/types";
import { env } from "../../../../apps/www/src/env";
import { adminProcedure, protectedProcedure, router } from "../trpc";

export const postsRouter = router({
  getPost: protectedProcedure
    .input(
      z.object({ username: z.string().optional(), post_id: z.string().min(1) }),
    )
    .query(async ({ ctx, input }) => {
      const query = ctx.supabase
        .from("posts")
        .select(
          "id, content, type, user_id, created_at, posts_images(*), likes(post_id, user_id), comments(id, thread_id, deleted_at), user:users!inner(name, username, image_name, type, verified_at, deactivated_at, banned_at, programs(name, slug, college_id, colleges(name, slug, campus_id, campuses(name, slug))))",
        )
        .eq("id", input.post_id)
        .is("deleted_at", null)
        .is("comments.deleted_at", null)
        .is("comments.thread_id", null)
        .order("created_at", {
          ascending: true,
          referencedTable: "comments",
        })
        .order("order", {
          ascending: true,
          referencedTable: "posts_images",
        });

      const { data: post } = input.username
        ? await query.eq("users.username", input.username).maybeSingle()
        : await query.maybeSingle();

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      const post_image_urls: {
        error: string | null;
        path: string | null;
        signedUrl: string;
      }[] = [];
      if (post.posts_images.length > 0) {
        const { data, error } = await ctx.supabase.storage
          .from("posts")
          .createSignedUrls(
            post.posts_images.map((image) => post.id + "/images/" + image.name),
            60,
          );

        if (error)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });

        post_image_urls.push(...data);
      }

      let image_url: string | null = null;
      if (
        post.user.image_name &&
        !post.user.image_name.startsWith("https://")
      ) {
        const { data } = ctx.supabase.storage
          .from("avatars")
          .getPublicUrl("users/" + post.user_id + "/" + post.user.image_name);
        image_url = data.publicUrl;
      }

      const REGEX = new RegExp(/@([\w-]+)/g);

      let matches;
      const results = [];

      while ((matches = REGEX.exec(post.content)) !== null) {
        results.push(matches[1] ?? "");
      }

      const { data: mentioned_users, error: mentioned_users_error } =
        await ctx.supabase.rpc("get_mention", {
          user_ids: results,
          // user_ids: [],
        });

      if (mentioned_users_error)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: mentioned_users_error.message,
        });

      return {
        userId: ctx.auth.user.id,
        mentioned_users,
        post: {
          ...post,
          posts_images: post.posts_images
            .filter(
              (image) =>
                post_image_urls.find(
                  (url) => url.path === post.id + "/images/" + image.name,
                )?.signedUrl,
            )
            .map((image) => {
              return {
                ...image,
                signed_url:
                  post_image_urls.find(
                    (url) => url.path === post.id + "/images/" + image.name,
                  )?.signedUrl ?? "",
              };
            }),
          user: post.user.image_name?.startsWith("https://")
            ? { ...post.user, image_url: post.user.image_name }
            : post.user.image_name && image_url
              ? { ...post.user, image_url }
              : { ...post.user, image_name: null },
        },
      };
    }),

  getUserPosts: protectedProcedure
    .input(
      z.object({
        user_id: z.string().min(1),
        cursor: z.number().int().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = 10;

      const { data: follower } = await ctx.supabase
        .from("followers")
        .select()
        .eq("follower_id", ctx.auth.user.id)
        .eq("followee_id", input.user_id)
        .single();

      const post_query = ctx.supabase
        .from("posts")
        .select(
          "id, type, user_id, user:users(image_name, program_id, programs(college_id, colleges(campus_id)))",
        )
        .eq("user_id", input.user_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit)
        .range((input.cursor - 1) * limit, input.cursor * limit);

      const [
        { data: current_user_from_db },
        { data: user_of_post },
        { data: posts },
      ] = await Promise.all([
        ctx.supabase
          .from("users")
          .select("*, programs(college_id, colleges(campus_id))")
          .eq("id", ctx.auth.user.id)
          .single(),
        ctx.supabase
          .from("users")
          .select("*, programs(college_id, colleges(campus_id))")
          .eq("id", input.user_id)
          .single(),
        follower ? post_query : post_query.neq("type", "following"),
      ]);

      if (!current_user_from_db || !user_of_post)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      if (posts === null)
        return {
          posts: [],
          userId: ctx.auth.user.id,
          nextCursor: undefined,
        };

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit - 1) {
        nextCursor = input.cursor + 1;
      }

      return {
        posts: posts.filter(
          (post) =>
            (post.user?.program_id === current_user_from_db.program_id &&
              post.type === "program") ||
            (post.user?.programs?.college_id ===
              current_user_from_db.programs?.college_id &&
              post.type === "college") ||
            (post.user?.programs?.colleges?.campus_id ===
              current_user_from_db.programs?.colleges?.campus_id &&
              post.type === "campus") ||
            post.type === "all" ||
            post.type === "following" ||
            post.user_id === ctx.auth.user.id,
        ),
        userId: ctx.auth.user.id,
        nextCursor,
      };
    }),
  getPosts: protectedProcedure
    .input(
      z.object({
        type: z.enum(["all", "campus", "college", "program", "following"]),
        cursor: z.number().int().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = 10;
      let posts: { id: string }[] = [];

      if (input.type === "all") {
        await ctx.supabase
          .from("posts")
          .select("id, users!inner(banned_at, deactivated_at)")
          .eq("type", "all")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(limit)
          .is("users.banned_at", null)
          .is("users.deactivated_at", null)
          .range((input.cursor - 1) * (limit + 1), input.cursor * limit)
          .then((res) => {
            if (res.error)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: res.error.message,
              });

            posts = res.data;
          });
      } else if (input.type === "campus") {
        const { data: user } = await ctx.supabase
          .from("users")
          .select("*, programs(*, colleges(campus_id))")
          .eq("id", ctx.auth.user.id)
          .single();

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        posts = await ctx.supabase
          .from("posts")
          .select(
            "id, users!inner(banned_at, deactivated_at, programs!inner(colleges(campus_id)))",
          )
          .eq("type", "campus")
          .eq(
            "users.programs.colleges.campus_id",
            user.programs?.colleges?.campus_id ?? "",
          )
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(limit)
          .range((input.cursor - 1) * (limit + 1), input.cursor * limit)
          .is("users.banned_at", null)
          .is("users.deactivated_at", null)
          .then((res) => {
            if (res.error)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: res.error.message,
              });

            return res.data.filter(
              (post) =>
                post.users.programs.colleges?.campus_id ===
                user.programs?.colleges?.campus_id,
            );
          });
      } else if (input.type === "college") {
        const { data: user } = await ctx.supabase
          .from("users")
          .select("programs(college_id)")
          .eq("id", ctx.auth.user.id)
          .single();

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        posts = await ctx.supabase
          .from("posts")
          .select(
            "id, users!inner(banned_at, deactivated_at, programs(college_id))",
          )
          .eq("type", "college")
          .eq("users.programs.college_id", user.programs?.college_id ?? "")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .is("users.banned_at", null)
          .is("users.deactivated_at", null)
          .limit(limit)
          .range((input.cursor - 1) * (limit + 1), input.cursor * limit)
          .then((res) => {
            if (res.error)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: res.error.message,
              });

            return res.data.filter(
              (post) =>
                post.users.programs?.college_id === user.programs?.college_id,
            );
          });
      } else if (input.type === "program") {
        const { data: user } = await ctx.supabase
          .from("users")
          .select("program_id")
          .eq("id", ctx.auth.user.id)
          .order("created_at", { ascending: false })
          .single();

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        posts = await ctx.supabase
          .from("posts")
          .select("id, users!inner(banned_at, deactivated_at, program_id)")
          .eq("type", "program")
          .eq("users.program_id", user.program_id)
          .is("deleted_at", null)
          .is("users.banned_at", null)
          .is("users.deactivated_at", null)
          .order("created_at", { ascending: false })
          .limit(limit)
          .range((input.cursor - 1) * (limit + 1), input.cursor * limit)
          .then((res) => {
            if (res.error)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: res.error.message,
              });

            return res.data.filter(
              (post) => post.users.program_id === user.program_id,
            );
          });
      } else {
        const { data: user } = await ctx.supabase
          .from("users")
          .select("*, programs(college_id, colleges(campus_id))")
          .eq("id", ctx.auth.user.id)
          .single();

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { data: following } = await ctx.supabase
          .from("followers")
          .select()
          .eq("follower_id", user.id);

        posts = await ctx.supabase
          .from("posts")
          .select(
            "id, type, users!inner(program_id, programs(*, colleges(campus_id)))",
          )
          .in("user_id", [
            ...new Set([
              ...(following ?? []).map((u) => u.followee_id),
              user.id,
            ]),
          ])
          .eq("type", "following")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(limit)
          .is("users.banned_at", null)
          .is("users.deactivated_at", null)
          .range((input.cursor - 1) * (limit + 1), input.cursor * limit)
          .then((res) => {
            if (res.error)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: res.error.message,
              });

            return res.data.filter(
              (post) =>
                (post.users.program_id === user.program_id &&
                  post.type === "program") ||
                (post.users.programs?.college_id ===
                  user.programs?.college_id &&
                  post.type === "college") ||
                (post.users.programs?.colleges?.campus_id ===
                  user.programs?.colleges?.campus_id &&
                  post.type === "campus") ||
                post.type === "all" ||
                post.type === "following",
            );
          });
      }

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit - 1) {
        nextCursor = input.cursor + 1;
      }

      return {
        posts,
        userId: ctx.auth.user.id,
        nextCursor,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .trim()
          .min(1, { message: "Post cannot be empty." })
          .max(512, {
            message: "Post cannot be longer than 512 characters.",
          }),
        type: z
          .custom<Database["public"]["Enums"]["post_type"]>()
          .default("following"),
        images: z
          .object({
            name: z.string().uuid(),
            order: z.number().nonnegative(),
          })
          .array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const content = input.content.replaceAll("  ", " ").trim();
      const rate_limiter = new Ratelimit({
        redis: ctx.redis,
        limiter: Ratelimit.fixedWindow(1, "60 s"),
      });

      if (env.NODE_ENV !== "development") {
        const { success } = await rate_limiter.limit(ctx.auth.user.id);

        if (!success) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You are posting too fast. Please try again in a minute.",
          });
        }
      }

      const { data: post, error: post_error } = await ctx.supabase
        .from("posts")
        .insert({
          content,
          user_id: ctx.auth.user.id,
          type: input.type,
        })
        .select("id")
        .single();

      if (post_error)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: post_error.message,
        });

      const signed_urls: {
        signedUrl: string;
        token: string;
        path: string;
      }[] = [];

      if (input.images.length > 0) {
        const data = await Promise.all(
          input.images.map(async (image) => {
            const { data } = await ctx.supabase.storage
              .from("posts")
              .createSignedUploadUrl(post.id + "/images/" + image.name);
            await ctx.supabase.from("posts_images").insert({
              post_id: post.id,
              name: image.name,
              order: image.order,
            });

            if (!data)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Error uploading image",
              });

            return data;
          }),
        );

        signed_urls.push(...data);
      }

      const uuidPattern =
        /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/g;
      const mentioned_users = content.match(uuidPattern) ?? [];

      const { data: new_notifications, error: error_new_notifications } =
        await ctx.supabase
          .from("notifications")
          .insert(
            mentioned_users.map((user_id) => ({
              to_id: user_id,
              type: "mention_post" as const,
              from_id: ctx.auth.user.id,
              content_id: post.id,
            })),
          )
          .select(
            "id, from:users!public_notifications_from_id_fkey(username), to:users!public_notifications_to_id_fkey(id)",
          );

      if (error_new_notifications)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error_new_notifications.message,
        });

      // TODO: don't send notifications to the user who is not same in program, college, campus
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      new_notifications.forEach(async (new_notification) => {
        if (!new_notification.from || !new_notification.to) return;

        const channel = ctx.supabase.channel(
          "notifications." + new_notification.to.id,
        );
        await channel.send({
          type: "broadcast",
          event: "mention_post",
          payload: {
            notification_id: new_notification.id,
            from: new_notification.from.username,
            post_id: post.id,
          },
        });
        await ctx.supabase.removeChannel(channel);
      });

      return { signed_urls };
    }),
  update: protectedProcedure
    .input(
      z.object({
        post_id: z.string().min(1),
        content: z.string().min(1, { message: "Post cannot be empty." }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: post_from_db } = await ctx.supabase
        .from("posts")
        .select()
        .eq("id", input.post_id)
        .eq("user_id", ctx.auth.user.id)
        .single();

      if (!post_from_db || post_from_db.deleted_at)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (post_from_db.user_id !== ctx.auth.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this post",
        });

      await ctx.supabase
        .from("posts")
        .update({ content: input.content })
        .eq("id", input.post_id)
        .eq("user_id", ctx.auth.user.id);
    }),
  delete: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data: post } = await ctx.supabase
        .from("posts")
        .select()
        .eq("id", input.post_id)
        .eq("user_id", ctx.auth.user.id)
        .single();

      if (!post || post.deleted_at)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (post.user_id !== ctx.auth.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this post",
        });

      await Promise.all([
        ctx.supabase
          .from("posts")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", post.id)
          .eq("user_id", ctx.auth.user.id),
        ctx.supabase
          .from("notifications")
          .delete()
          .eq("content_id", post.id)
          .in("type", ["like", "comment"]),
      ]);
    }),
  report: protectedProcedure
    .input(z.object({ post_id: z.string().min(1), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: post } = await ctx.supabase
        .from("posts")
        .select()
        .eq("id", input.post_id)
        .single();

      if (!post || post.deleted_at)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (post.user_id === ctx.auth.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to report this post",
        });

      await ctx.supabase.from("reported_posts").insert({
        reason: input.reason,
        reported_by_id: ctx.auth.user.id,
        post_id: input.post_id,
      });
    }),
  strike: adminProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data: post } = await ctx.supabase
        .from("posts")
        .select()
        .eq("id", input.post_id)
        .single();

      if (!post || post.deleted_at)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      await Promise.all([
        ctx.supabase
          .from("posts")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", input.post_id),
        (async () => {
          const { data: strikes } = await ctx.supabase
            .from("strikes")
            .select("id")
            .eq("user_id", post.user_id);

          if (strikes !== null && strikes.length >= 2) {
            await ctx.supabase
              .from("users")
              .update({ banned_at: new Date().toISOString() })
              .eq("id", post.user_id);
          }
          await ctx.supabase.from("strikes").insert({
            user_id: post.user_id,
            reason: "Posting inappropriate content",
          });
        })(),
        ctx.supabase.from("notifications").insert({
          from_id: ctx.auth.user.id,
          to_id: post.user_id,
          type: "strike_post",
        }),
      ]);
    }),
  like: protectedProcedure
    .input(
      z.object({
        post_id: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: like } = await ctx.supabase
        .from("likes")
        .select()
        .eq("user_id", ctx.auth.user.id)
        .eq("post_id", input.post_id)
        .single();

      if (like)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already liked." });

      const { data: post } = await ctx.supabase
        .from("posts")
        .select()
        .eq("id", input.post_id)
        .single();

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      const id = uuid();

      await ctx.supabase.from("likes").insert({
        id,
        user_id: ctx.auth.user.id,
        post_id: input.post_id,
      });

      if (post.user_id !== ctx.auth.user.id) {
        const { data: new_notification } = await ctx.supabase
          .from("notifications")
          .insert({
            to_id: post.user_id,
            type: "like",
            from_id: ctx.auth.user.id,
            content_id: post.id,
          })
          .select(
            "id, from:users!public_notifications_from_id_fkey(username), to:users!public_notifications_to_id_fkey(username)",
          )
          .single();

        if (new_notification?.from?.username && new_notification.to?.username) {
          const channel = ctx.supabase.channel("notifications." + post.user_id);
          await channel.send({
            type: "broadcast",
            event: "like_post",
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

      const { data: return_like } = await ctx.supabase
        .from("likes")
        .select()
        .eq("id", id)
        .eq("user_id", ctx.auth.user.id)
        .single();

      if (!return_like)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong.",
        });

      return { like: return_like, userId: ctx.auth.user.id };
    }),

  unlike: protectedProcedure
    .input(
      z.object({
        post_id: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: unlike } = await ctx.supabase
        .from("likes")
        .select()
        .eq("user_id", ctx.auth.user.id)
        .eq("post_id", input.post_id)
        .single();

      if (!unlike)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not liked." });

      const { data: post } = await ctx.supabase
        .from("posts")
        .select()
        .eq("id", input.post_id)
        .single();

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      await ctx.supabase
        .from("likes")
        .delete()
        .eq("user_id", ctx.auth.user.id)
        .eq("post_id", input.post_id);

      if (post.user_id !== ctx.auth.user.id) {
        await ctx.supabase
          .from("notifications")
          .delete()
          .eq("to_id", post.user_id)
          .eq("from_id", ctx.auth.user.id)
          .eq("type", "like")
          .eq("content_id", input.post_id);
      }

      return { like: unlike, userId: ctx.auth.user.id };
    }),

  getLikesInPost: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { data: likes } = await ctx.supabase
        .from("likes")
        .select(
          "*, user: users(*, programs(name, slug, colleges(name, slug, campuses(name, slug))))",
        )
        .eq("post_id", input.post_id)
        .order("created_at", { ascending: false })
        .then((res) => {
          if (res.error)
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: res.error.message,
            });

          return res;
        });

      return likes.map((like) => {
        let image_url: string | null = null;

        if (
          like.user?.image_name &&
          !like.user.image_name.startsWith("https:")
        ) {
          const { data } = ctx.supabase.storage
            .from("avatars")
            .getPublicUrl("users/" + like.user_id + "/" + like.user.image_name);

          image_url = data.publicUrl;
        }

        return {
          ...like,
          user: like.user?.image_name?.startsWith("https://")
            ? {
                ...like.user,
                image_url: like.user.image_name,
              }
            : like.user?.image_name && image_url
              ? {
                  ...like.user,
                  image_url,
                }
              : {
                  ...like.user,
                  image_name: null,
                },
        };
      });
    }),
});
