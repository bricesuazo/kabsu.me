import { TRPCError } from "@trpc/server";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import type { Database } from "../../../../supabase/types";
import { protectedProcedure, router } from "../trpc";

export const postsRouter = router({
  getPost: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { data: post } = await ctx.supabase
        .from("posts")
        .select(
          "*, likes(*), comments(*), user: users(*, programs(*, colleges(*, campuses(*))))",
        )
        .eq("id", input.post_id)
        .is("deleted_at", null)
        .is("comments.deleted_at", null)
        .order("comments.created_at", { ascending: false })
        .single();

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      let image_url: string | null = null;
      if (post.user?.image_path) {
        const { data } = await ctx.supabase.storage
          .from("users")
          .createSignedUrl(
            post.user.id + "/" + post.user.image_path,
            60 * 60 * 24,
          );
        if (data) {
          image_url = data.signedUrl;
        }
      }

      return {
        userId: ctx.auth.session.user.id,
        post:
          post.user?.image_path && image_url
            ? { ...post, user: { ...post.user, image_url } }
            : { ...post, user: { ...post.user, image_path: null } },
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

      const { data: current_user_from_db } = await ctx.supabase
        .from("users")
        .select("*, programs(*, colleges(*, campuses(*)))")
        .eq("id", ctx.auth.session.user.id)
        .single();

      const { data: user_of_post } = await ctx.supabase
        .from("users")
        .select("*, programs(*, colleges(*, campuses(*)))")
        .eq("id", input.user_id)
        .single();

      // const { data: is_follower } = await ctx.supabase
      //   .from("followers")
      //   .select()
      //   .eq("follower_id", ctx.auth.session.user.id)
      //   .eq("followee_id", input.user_id)
      //   .single();

      if (!current_user_from_db || !user_of_post)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      // const posts = await ctx.db.query.posts.findMany({
      //   where: (post, { and, eq, isNull }) =>
      //     and(
      //       isNull(post.deleted_at),
      //       eq(post.user_id, input.user_id),

      //       current_user_from_db.id !== user_of_post.id
      //         ? or(
      //             eq(post.type, "all"),
      //             current_user_from_db.program_id === user_of_post.program_id
      //               ? eq(post.type, "program")
      //               : undefined,

      //             current_user_from_db.program?.college_id ===
      //               user_of_post.program?.college_id
      //               ? eq(post.type, "college")
      //               : undefined,

      //             current_user_from_db.program?.college.campus_id ===
      //               user_of_post.program?.college.campus_id
      //               ? eq(post.type, "campus")
      //               : undefined,

      //             is_follower ? eq(post.type, "following") : undefined,
      //           )
      //         : undefined,
      //     ),

      //   orderBy: (post, { desc }) => desc(post.created_at),
      //   limit,
      //   offset: (input.cursor - 1) * limit,
      //   with: {
      //     comments: true,
      //     likes: true,
      //     user: {
      //       with: {
      //         program: {
      //           with: {
      //             college: {
      //               with: { campus: true },
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      // });

      const { data: posts } = await ctx.supabase
        .from("posts")
        .select(
          "*, likes(*), comments(*), user: users(*, programs(*, colleges(*, campuses(*))))",
        )
        .eq("user_id", input.user_id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit)
        .range((input.cursor - 1) * limit, input.cursor * limit);

      if (posts === null)
        return {
          posts: [],
          userId: ctx.auth.session.user.id,
          nextCursor: undefined,
        };

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit - 1) {
        nextCursor = input.cursor + 1;
      }

      return {
        posts,
        userId: ctx.auth.session.user.id,
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
      // const test = await ctx.db.query.posts.findMany({
      //   where: (post, { isNull, and, eq }) =>
      //     and(isNull(post.deleted_at), eq(post.type, input.type)),
      // });
      const limit = 10;
      let posts: Database["public"]["Tables"]["posts"]["Row"][] = [];

      if (input.type === "all") {
        // posts = await ctx.db.query.posts.findMany({
        //   where: (post, { isNull, and, eq }) =>
        //     and(isNull(post.deleted_at), eq(post.type, "all")),
        //   orderBy: (post, { desc }) => desc(post.created_at),
        //   limit,
        //   offset: (input.cursor - 1) * limit,

        //   // with: {
        //   //   comments: {
        //   //     where: (comment, { isNull }) => isNull(comment.deleted_at),
        //   //   },
        //   //   likes: true,
        //   //   user: {
        //   //     with: {
        //   //       program: {
        //   //         with: {
        //   //           college: {
        //   //             with: {
        //   //               campus: true,
        //   //             },
        //   //           },
        //   //         },
        //   //       },
        //   //     },
        //   //   },
        //   // },
        // });

        await ctx.supabase
          .from("posts")
          .select()
          .eq("type", "all")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(10)
          .range((input.cursor - 1) * 10, input.cursor * 10)
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
          .select("*, programs(*, colleges(*, campuses(*)))")
          .eq("id", ctx.auth.session.user.id)
          .single();

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { data: colleges } = await ctx.supabase
          .from("colleges")
          .select()
          .eq("campus_id", user.programs[0]?.colleges?.campus_id ?? "");

        const { data: programs } = colleges?.length
          ? await ctx.supabase
              .from("programs")
              .select()
              .in(
                "college_id",
                colleges.map((c) => c.id),
              )
          : { data: [] };

        const { data: users_in_campuses } = programs?.length
          ? await ctx.supabase
              .from("users")
              .select("*, programs(*, colleges(*, campuses(*)))")
              .in(
                "program_id",
                programs.map((c) => c.id),
              )
          : { data: [] };

        // posts = await ctx.db.query.posts.findMany({
        //   where: (post, { or, and, eq, isNull, inArray }) =>
        //     and(
        //       or(
        //         users_in_campuses.length > 0
        //           ? inArray(
        //               post.user_id,
        //               usersInCampuses.map((f) => f.id),
        //             )
        //           : undefined,
        //         eq(post.user_id, ctx.auth.session.user.id),
        //       ),
        //       isNull(post.deleted_at),
        //       eq(post.type, "campus"),
        //     ),

        //   limit,
        //   offset: (input.cursor - 1) * limit,
        //   orderBy: (post, { desc }) => desc(post.created_at),
        //   // with: {
        //   //   comments: {
        //   //     where: (comment, { isNull }) => isNull(comment.deleted_at),
        //   //   },
        //   //   likes: true,
        //   //   user: {
        //   //     with: {
        //   //       program: {
        //   //         with: {
        //   //           college: {
        //   //             with: {
        //   //               campus: true,
        //   //             },
        //   //           },
        //   //         },
        //   //       },
        //   //     },
        //   //   },
        //   // },
        // });

        posts = users_in_campuses?.length
          ? await ctx.supabase
              .from("posts")
              .select()
              .in(
                "user_id",
                users_in_campuses.map((u) => u.id),
              )
              .eq("type", "campus")
              .is("deleted_at", null)
              .order("created_at", { ascending: false })
              .limit(10)
              .range((input.cursor - 1) * 10, input.cursor * 10)
              .then((res) => {
                if (res.error)
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: res.error.message,
                  });

                return res.data;
              })
          : [];
      } else if (input.type === "college") {
        const { data: user } = await ctx.supabase
          .from("users")
          .select("*, programs(*, colleges(*, campuses(*)))")
          .eq("id", ctx.auth.session.user.id)
          .single();

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        // const { data: users_in_programs } = await ctx.supabase
        //   .from("users")
        //   .select("*, programs(*, colleges(*, campuses(*)))")
        //   .eq("program_id", user.program_id ?? "");

        const { data: colleges } = await ctx.supabase
          .from("colleges")
          .select()
          .eq("id", user.programs[0]?.college_id ?? "");

        const users_in_colleges = colleges?.length
          ? await ctx.supabase
              .from("users")
              .select("*, programs(*, colleges(*, campuses(*)))")
              .in(
                "program_id",
                colleges.map((c) => c.id),
              )
              .then((res) => {
                if (res.error)
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: res.error.message,
                  });

                return res.data;
              })
          : [];

        // posts = await ctx.db.query.posts.findMany({
        //   where: (post, { or, and, eq, isNull, inArray }) =>
        //     and(
        //       isNull(post.deleted_at),
        //       or(
        //         users_in_programs.length > 0
        //           ? inArray(
        //               post.user_id,
        //               users_in_colleges.map((f) => f.id),
        //             )
        //           : undefined,
        //         eq(post.user_id, ctx.auth.session.user.id),
        //       ),
        //       eq(post.type, "college"),
        //     ),
        //   limit,
        //   offset: (input.cursor - 1) * limit,
        //   orderBy: (post, { desc }) => desc(post.created_at),
        //   // with: {
        //   //   comments: {
        //   //     where: (comment, { isNull }) => isNull(comment.deleted_at),
        //   //   },
        //   //   likes: true,
        //   //   user: {
        //   //     with: {
        //   //       program: {
        //   //         with: {
        //   //           college: {
        //   //             with: {
        //   //               campus: true,
        //   //             },
        //   //           },
        //   //         },
        //   //       },
        //   //     },
        //   //   },
        //   // },
        // });

        posts = users_in_colleges.length
          ? await ctx.supabase
              .from("posts")
              .select()
              .in(
                "user_id",
                users_in_colleges.map((u) => u.id),
              )
              .eq("type", "college")
              .is("deleted_at", null)
              .order("created_at", { ascending: false })
              .limit(10)
              .range((input.cursor - 1) * 10, input.cursor * 10)
              .then((res) => {
                if (res.error)
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: res.error.message,
                  });

                return res.data;
              })
          : [];
      } else if (input.type === "program") {
        const { data: user } = await ctx.supabase
          .from("users")
          .select("*, programs(*)")
          .eq("id", ctx.auth.session.user.id)
          .order("created_at", { ascending: false })
          .single();

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const users_in_programs = await ctx.supabase
          .from("users")
          .select("*, programs(*)")
          .eq("program_id", user.program_id ?? "")
          .then((res) => {
            if (res.error)
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: res.error.message,
              });

            return res.data;
          });

        // posts = await ctx.db.query.posts.findMany({
        //   where: (post, { or, and, eq, isNull, inArray }) =>
        //     and(
        //       or(
        //         users_in_programs.length > 0
        //           ? inArray(
        //               post.user_id,
        //               users_in_programs.map((f) => f.id),
        //             )
        //           : undefined,
        //         eq(post.user_id, ctx.auth.session.user.id),
        //       ),
        //       eq(post.type, "program"),
        //       isNull(post.deleted_at),
        //     ),

        //   orderBy: (post, { desc }) => desc(post.created_at),
        //   limit,
        //   offset: (input.cursor - 1) * limit,
        //   // with: {
        //   //   comments: {
        //   //     where: (comment, { isNull }) => isNull(comment.deleted_at),
        //   //   },
        //   //   likes: true,
        //   //   user: {
        //   //     with: {
        //   //       program: {
        //   //         with: {
        //   //           college: {
        //   //             with: {
        //   //               campus: true,
        //   //             },
        //   //           },
        //   //         },
        //   //       },
        //   //     },
        //   //   },
        //   // },
        // });

        posts = users_in_programs.length
          ? await ctx.supabase
              .from("posts")
              .select()
              .in(
                "user_id",
                users_in_programs.map((u) => u.id),
              )
              .eq("type", "program")
              .is("deleted_at", null)
              .order("created_at", { ascending: false })
              .limit(10)
              .range((input.cursor - 1) * 10, input.cursor * 10)
              .then((res) => {
                if (res.error)
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: res.error.message,
                  });

                return res.data;
              })
          : [];
      } else {
        const { data: user } = await ctx.supabase
          .from("users")
          .select("*, programs(*, colleges(*, campuses(*)))")
          .eq("id", ctx.auth.session.user.id)
          .single();

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const { data: following } = await ctx.supabase
          .from("followers")
          .select()
          .eq("follower_id", ctx.auth.session.user.id);

        const users = following?.length
          ? await ctx.supabase
              .from("users")
              .select("*, programs(*, colleges(*, campuses(*)))")
              .in(
                "id",
                following.map((f) => f.followee_id),
              )
              .then((res) => {
                if (res.error)
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: res.error.message,
                  });

                return res.data;
              })
          : [];

        // posts = await ctx.db.query.posts.findMany({
        //   where: (post, { or, and, eq, isNull, inArray }) =>
        //     and(
        //       isNull(post.deleted_at),
        //       or(
        //         eq(post.user_id, ctx.auth.session.user.id),
        //         and(
        //           following.length > 0
        //             ? inArray(
        //                 post.user_id,
        //                 following.map((f) => f.followee_id),
        //               )
        //             : undefined,

        //           or(eq(post.type, "following"), eq(post.type, "all")),
        //         ),
        //         and(
        //           users.filter((u) => u.program_id === user.program_id).length >
        //             0
        //             ? inArray(
        //                 post.user_id,
        //                 users
        //                   .filter((u) => u.program_id === user.program_id)
        //                   .map((f) => f.id),
        //               )
        //             : undefined,
        //           eq(post.type, "program"),
        //         ),
        //         and(
        //           users.filter(
        //             (u) => u.program?.college_id === user.program?.college_id,
        //           ).length > 0
        //             ? inArray(
        //                 post.user_id,
        //                 users
        //                   .filter(
        //                     (u) =>
        //                       u.program?.college_id ===
        //                       user.program?.college_id,
        //                   )
        //                   .map((f) => f.id),
        //               )
        //             : undefined,
        //           eq(post.type, "college"),
        //         ),
        //         and(
        //           users.filter(
        //             (u) =>
        //               u.program?.college.campus_id ===
        //               user.program?.college.campus_id,
        //           ).length > 0
        //             ? inArray(
        //                 post.user_id,
        //                 users
        //                   .filter(
        //                     (u) =>
        //                       u.program?.college.campus_id ===
        //                       user.program?.college.campus_id,
        //                   )
        //                   .map((f) => f.id),
        //               )
        //             : undefined,
        //           eq(post.type, "campus"),
        //         ),
        //       ),
        //     ),

        //   limit,
        //   offset: (input.cursor - 1) * limit,
        //   orderBy: (post, { desc }) => desc(post.created_at),
        //   // with: {
        //   //   comments: {
        //   //     where: (comment, { isNull }) => isNull(comment.deleted_at),
        //   //   },
        //   //   likes: true,
        //   //   user: {
        //   //     with: {
        //   //       program: {
        //   //         with: {
        //   //           college: {
        //   //             with: {
        //   //               campus: true,
        //   //             },
        //   //           },
        //   //         },
        //   //       },
        //   //     },
        //   //   },
        //   // },
        // });

        posts = users.length
          ? await ctx.supabase
              .from("posts")
              .select()
              .in(
                "user_id",
                users.map((u) => u.id),
              )
              .in("type", ["following", "all"])
              .is("deleted_at", null)
              .order("created_at", { ascending: false })
              .limit(10)
              .range((input.cursor - 1) * 10, input.cursor * 10)
              .then((res) => {
                if (res.error)
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: res.error.message,
                  });

                return res.data;
              })
          : [];
      }

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit - 1) {
        nextCursor = input.cursor + 1;
      }

      return {
        posts,
        userId: ctx.auth.session.user.id,
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase.from("posts").insert({
        content: input.content,
        user_id: ctx.auth.session.user.id,
        type: input.type,
      });
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
        .eq("user_id", ctx.auth.session.user.id)
        .single();

      if (!post_from_db || post_from_db.deleted_at)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (post_from_db.user_id !== ctx.auth.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this post",
        });

      await ctx.supabase
        .from("posts")
        .update({ content: input.content })
        .eq("id", input.post_id)
        .eq("user_id", ctx.auth.session.user.id);
    }),

  delete: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data: post } = await ctx.supabase
        .from("posts")
        .select()
        .eq("id", input.post_id)
        .eq("user_id", ctx.auth.session.user.id)
        .single();

      if (!post || post.deleted_at)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (post.user_id !== ctx.auth.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this post",
        });

      await Promise.all([
        ctx.supabase
          .from("posts")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", post.id)
          .eq("user_id", ctx.auth.session.user.id),
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

      if (post.user_id === ctx.auth.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to report this post",
        });

      // await ctx.db.insert(reported_posts).values({
      //   reason: input.reason,
      //   reported_by_id: ctx.auth.session.user.id,
      //   post_id: input.post_id,
      // });

      await ctx.supabase.from("reported_posts").insert({
        reason: input.reason,
        reported_by_id: ctx.auth.session.user.id,
        post_id: input.post_id,
      });
    }),

  // getUserPosts: protectedProcedure
  //   .input(
  //     z.object({
  //       user_id: z.string().min(1),
  //       page: z.number().int().positive(),
  //     }),
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const posts = await ctx.db.query.posts.findMany({
  //       where: (post, { and, eq, isNull }) =>
  //         and(isNull(post.deleted_at), eq(post.user_id, ctx.auth.session.user.id)),

  //       limit: 10,
  //       offset: (input.page - 1) * 10,
  //       orderBy: (post, { desc }) => desc(post.created_at),
  //       with: {
  //         comments: {
  //           where: (comment, { isNull }) => isNull(comment.deleted_at),
  //         },
  //         likes: true,
  //         user: {
  //           with: {
  //             program: {
  //               with: {
  //                 college: {
  //                   with: {
  //                     campus: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     return posts;
  //   }),

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
        .eq("user_id", ctx.auth.session.user.id)
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
        user_id: ctx.auth.session.user.id,
        post_id: input.post_id,
      });

      if (post.user_id !== ctx.auth.session.user.id) {
        await ctx.supabase.from("notifications").insert({
          to_id: post.user_id,
          type: "like",
          from_id: ctx.auth.session.user.id,
          content_id: post.id,
        });
      }

      const { data: return_like } = await ctx.supabase
        .from("likes")
        .select()
        .eq("id", id)
        .eq("user_id", ctx.auth.session.user.id)
        .single();

      if (!return_like)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong.",
        });

      return { like: return_like, userId: ctx.auth.session.user.id };
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
        .eq("user_id", ctx.auth.session.user.id)
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
        .eq("user_id", ctx.auth.session.user.id)
        .eq("post_id", input.post_id);

      if (post.user_id !== ctx.auth.session.user.id) {
        await ctx.supabase
          .from("notifications")
          .delete()
          .eq("to_id", post.user_id)
          .eq("from_id", ctx.auth.session.user.id)
          .eq("type", "like")
          .eq("content_id", input.post_id);
      }

      return { like: unlike, userId: ctx.auth.session.user.id };
    }),

  getLikesInPost: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { data: likes } = await ctx.supabase
        .from("likes")
        .select("*, user: users(*, programs(*, colleges(*, campuses(*))))")
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

      const image_urls: {
        error: string | null;
        path: string | null;
        signedUrl: string;
      }[] = [];
      const { data } = await ctx.supabase.storage
        .from("users")
        .createSignedUrls(
          likes.map((like) => like.user?.id + "/" + like.user?.image_path),
          60 * 60 * 24,
        );
      if (data) {
        image_urls.push(...data);
      }

      return likes.map((like) => {
        const signed_url = image_urls.find(
          (url) => url.path === like.user?.id + "/" + like.user?.image_path,
        )?.signedUrl;

        return {
          ...like,
          user:
            like.user?.image_path && signed_url
              ? {
                  ...like.user,
                  image_url: signed_url,
                }
              : {
                  ...like.user,
                  image_path: null,
                },
        };
      });
    }),
});
