import { POST_TYPE, likes, notifications } from "./../../db/schema/schema";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import {
  Campus,
  College,
  Comment,
  Follower,
  Like,
  Post,
  Program,
  User,
  posts,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

export const postsRouter = router({
  getPost: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: (post, { eq, and, isNull }) =>
          and(eq(post.id, input.post_id), isNull(post.deleted_at)),
        with: {
          likes: true,
          comments: {
            where: (comment, { isNull }) => isNull(comment.deleted_at),
            orderBy: (comment, { desc }) => desc(comment.created_at),
          },
          user: {
            with: {
              program: {
                with: {
                  college: {
                    with: { campus: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!post) notFound();

      const user = await ctx.clerk.users.getUser(post.user.id);

      return {
        userId: ctx.session.user.id,
        post: {
          ...post,
          user: {
            ...post.user,
            ...user,
          },
        },
      };
    }),

  getUserPosts: protectedProcedure
    .input(
      z.object({
        user_id: z.string().nonempty(),
        cursor: z.number().int().positive(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = 10;
      const posts = await ctx.db.query.posts.findMany({
        where: (post, { and, eq, isNull }) =>
          and(isNull(post.deleted_at), eq(post.user_id, input.user_id)),
        orderBy: (post, { desc }) => desc(post.created_at),
        limit,
        offset: (input.cursor - 1) * limit,
        with: {
          comments: true,
          likes: true,
          user: {
            with: {
              program: {
                with: {
                  college: {
                    with: { campus: true },
                  },
                },
              },
            },
          },
        },
      });

      const usersFromPosts = await ctx.clerk.users.getUserList({
        userId: posts.map((post) => post.user.id),
      });

      const returnPosts = posts.map((post) => ({
        ...post,
        user: {
          ...post.user,
          ...usersFromPosts.find((user) => user.id === post.user.id)!,
        },
      }));

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit - 1) {
        nextCursor = input.cursor + 1;
      }

      return {
        posts: returnPosts,
        userId: ctx.session.user.id,
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
      let posts: (Post & {
        likes: Like[];
        comments: Comment[];
        user: User & {
          program: Program & { college: College & { campus: Campus } };
        };
      })[] = [];

      if (input.type === "all") {
        posts = await ctx.db.query.posts.findMany({
          where: (post, { isNull, and, eq }) =>
            and(isNull(post.deleted_at), eq(post.type, "all")),
          orderBy: (post, { desc }) => desc(post.created_at),
          limit,
          offset: (input.cursor - 1) * limit,

          with: {
            comments: {
              where: (comment, { isNull }) => isNull(comment.deleted_at),
            },
            likes: true,
            user: {
              with: {
                program: {
                  with: {
                    college: {
                      with: {
                        campus: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } else if (input.type === "campus") {
        const user = await ctx.db.query.users.findFirst({
          where: (user, { eq }) => eq(user.id, ctx.session.user.id),
          with: {
            program: {
              with: {
                college: {
                  with: {
                    campus: true,
                  },
                },
              },
            },
          },
        });

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const colleges = await ctx.db.query.colleges.findMany({
          where: (college, { eq }) =>
            eq(college.campus_id, user.program.college.campus_id),
        });

        const programs = await ctx.db.query.programs.findMany({
          where: (program, { inArray }) =>
            inArray(
              program.college_id,
              colleges.map((c) => c.id),
            ),
        });

        const usersInCampuses: User[] =
          colleges.length > 0
            ? await ctx.db.query.users.findMany({
                where: (userInDB, { inArray }) =>
                  inArray(
                    userInDB.program_id,
                    programs.map((c) => c.id),
                  ),
              })
            : [];

        posts = await ctx.db.query.posts.findMany({
          where: (post, { or, and, eq, isNull, inArray }) =>
            and(
              or(
                usersInCampuses.length > 0
                  ? inArray(
                      post.user_id,
                      usersInCampuses.map((f) => f.id),
                    )
                  : undefined,
                eq(post.user_id, ctx.session.user.id),
              ),
              isNull(post.deleted_at),
              eq(post.type, "campus"),
            ),

          limit,
          offset: (input.cursor - 1) * limit,
          orderBy: (post, { desc }) => desc(post.created_at),
          with: {
            comments: {
              where: (comment, { isNull }) => isNull(comment.deleted_at),
            },
            likes: true,
            user: {
              with: {
                program: {
                  with: {
                    college: {
                      with: {
                        campus: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } else if (input.type === "college") {
        const user = await ctx.db.query.users.findFirst({
          where: (user, { eq }) => eq(user.id, ctx.session.user.id),
          with: {
            program: {
              with: {
                college: true,
              },
            },
          },
        });

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const usersInPrograms: User[] = await ctx.db.query.users.findMany({
          where: (userInDB, { eq }) => eq(userInDB.program_id, user.program_id),
        });

        const colleges = await ctx.db.query.programs.findMany({
          where: (program, { eq }) =>
            eq(program.college_id, user.program.college_id),
        });

        const usersInColleges: User[] =
          colleges.length > 0
            ? await ctx.db.query.users.findMany({
                where: (userInDB, { and, inArray }) =>
                  inArray(
                    userInDB.program_id,
                    colleges.map((c) => c.id),
                  ),
              })
            : [];

        posts = await ctx.db.query.posts.findMany({
          where: (post, { or, and, eq, isNull, inArray }) =>
            and(
              isNull(post.deleted_at),
              or(
                usersInPrograms.length > 0
                  ? inArray(
                      post.user_id,
                      usersInColleges.map((f) => f.id),
                    )
                  : undefined,
                eq(post.user_id, ctx.session.user.id),
              ),
              eq(post.type, "college"),
            ),
          limit,
          offset: (input.cursor - 1) * limit,
          orderBy: (post, { desc }) => desc(post.created_at),
          with: {
            comments: {
              where: (comment, { isNull }) => isNull(comment.deleted_at),
            },
            likes: true,
            user: {
              with: {
                program: {
                  with: {
                    college: {
                      with: {
                        campus: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } else if (input.type === "program") {
        const user = await ctx.db.query.users.findFirst({
          where: (user, { eq }) => eq(user.id, ctx.session.user.id),
          orderBy: (post, { desc }) => desc(post.created_at),
          with: {
            program: true,
          },
        });

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const usersInPrograms: User[] = await ctx.db.query.users.findMany({
          where: (userInDB, { eq }) => eq(userInDB.program_id, user.program_id),
        });

        posts = await ctx.db.query.posts.findMany({
          where: (post, { or, and, eq, isNull, inArray }) =>
            and(
              or(
                usersInPrograms.length > 0
                  ? inArray(
                      post.user_id,
                      usersInPrograms.map((f) => f.id),
                    )
                  : undefined,
                eq(post.user_id, ctx.session.user.id),
              ),
              eq(post.type, "program"),
              isNull(post.deleted_at),
            ),

          orderBy: (post, { desc }) => desc(post.created_at),
          limit,
          offset: (input.cursor - 1) * limit,
          with: {
            comments: {
              where: (comment, { isNull }) => isNull(comment.deleted_at),
            },
            likes: true,
            user: {
              with: {
                program: {
                  with: {
                    college: {
                      with: {
                        campus: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } else if (input.type === "following") {
        const user = await ctx.db.query.users.findFirst({
          where: (user, { eq }) => eq(user.id, ctx.session.user.id),
          with: {
            program: {
              with: {
                college: {
                  with: {
                    campus: true,
                  },
                },
              },
            },
          },
        });

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const following: Follower[] = await ctx.db.query.followers.findMany({
          where: (follower, { eq }) =>
            eq(follower.follower_id, ctx.session.user.id),
        });

        posts = await ctx.db.query.posts.findMany({
          where: (post, { or, and, eq, isNull, inArray }) =>
            and(
              isNull(post.deleted_at),
              or(
                following.length > 0
                  ? inArray(
                      post.user_id,
                      following.map((f) => f.followee_id),
                    )
                  : undefined,
                eq(post.user_id, ctx.session.user.id),
              ),
              eq(post.type, "following"),
            ),

          limit,
          offset: (input.cursor - 1) * limit,
          orderBy: (post, { desc }) => desc(post.created_at),
          with: {
            comments: {
              where: (comment, { isNull }) => isNull(comment.deleted_at),
            },
            likes: true,
            user: {
              with: {
                program: {
                  with: {
                    college: {
                      with: {
                        campus: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }

      const usersFromPosts = await ctx.clerk.users.getUserList({
        userId: posts.map((post) => post.user && post.user.id),
      });

      const returnPosts = posts.map((post) => ({
        ...post,
        user: {
          ...post.user,
          ...usersFromPosts.find((user) => user.id === post.user.id)!,
        },
      }));

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit - 1) {
        nextCursor = input.cursor + 1;
      }

      return {
        posts: returnPosts,
        userId: ctx.session.user.id,
        nextCursor,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .trim()
          .nonempty({ message: "Post cannot be empty." })
          .max(512, {
            message: "Post cannot be longer than 512 characters.",
          }),
        type: z.enum(POST_TYPE).default(POST_TYPE[0]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        content: input.content,
        user_id: ctx.session.user.id,
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
      const postFromDB = await ctx.db.query.posts.findFirst({
        where: (posts, { and, eq }) =>
          and(
            eq(posts.id, input.post_id),
            eq(posts.user_id, ctx.session.user.id),
          ),
      });

      if (!postFromDB || postFromDB.deleted_at)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (postFromDB.user_id !== ctx.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this post",
        });

      await ctx.db
        .update(posts)
        .set({ content: input.content })
        .where(
          and(
            eq(posts.id, postFromDB.id),
            eq(posts.user_id, ctx.session.user.id),
          ),
        );
    }),

  delete: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { and, eq }) =>
          and(
            eq(posts.id, input.post_id),
            eq(posts.user_id, ctx.session.user.id),
          ),
      });

      if (!post || post.deleted_at)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (post.user_id !== ctx.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this post",
        });

      await ctx.db
        .update(posts)
        .set({ deleted_at: new Date() })
        .where(
          and(eq(posts.id, post.id), eq(posts.user_id, ctx.session.user.id)),
        );
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
  //         and(isNull(post.deleted_at), eq(post.user_id, ctx.session.user.id)),

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

  //     const usersFromPosts = await ctx.clerk.users.getUserList({
  //       userId: posts.map((post) => post.user && post.user.id),
  //     });

  //     const returnPosts = posts.map((post) => ({
  //       ...post,
  //       user: {
  //         ...post.user,
  //         ...usersFromPosts.find((user) => user.id === post.user.id)!,
  //       },
  //     }));

  //     return returnPosts;
  //   }),

  like: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const like = await ctx.db.query.likes.findFirst({
        where: (likes, { and, eq }) =>
          and(
            eq(likes.user_id, ctx.session.user.id),
            eq(likes.post_id, input.post_id),
          ),
      });

      if (like)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already liked." });

      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, input.post_id),
      });

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      await ctx.db
        .insert(likes)
        .values({ user_id: ctx.session.user.id, post_id: input.post_id });

      if (post.user_id !== ctx.session.user.id) {
        await ctx.db.insert(notifications).values({
          to_id: post.user_id,
          type: "like",
          from_id: ctx.session.user.id,
          link: input.post_id,
        });
      }
    }),

  unlike: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const unlike = await ctx.db.query.likes.findFirst({
        where: (likes, { and, eq }) =>
          and(
            eq(likes.user_id, ctx.session.user.id),
            eq(likes.post_id, input.post_id),
          ),
      });

      if (!unlike)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not liked." });

      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, input.post_id),
      });

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      await ctx.db
        .delete(likes)
        .where(
          and(
            eq(likes.user_id, ctx.session.user.id),
            eq(likes.post_id, input.post_id),
          ),
        );

      if (post.user_id !== ctx.session.user.id) {
        await ctx.db
          .delete(notifications)
          .where(
            and(
              eq(notifications.to_id, post.user_id),
              eq(notifications.from_id, ctx.session.user.id),
              eq(notifications.type, "like"),
            ),
          );
      }
    }),

  getLikesInPost: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const likes = await ctx.db.query.likes.findMany({
        where: (like, { eq }) => eq(like.post_id, input.post_id),
        with: {
          user: true,
        },
        orderBy: (like, { desc }) => desc(like.created_at),
      });

      const users = await ctx.clerk.users.getUserList({
        userId: likes.map((like) => like.user_id),
      });

      return likes.map((like) => ({
        ...like,
        user: users.find((user) => user.id === like.user_id)!,
      }));
    }),
});
