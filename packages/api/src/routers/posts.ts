import { TRPCError } from "@trpc/server";
import { and, eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

import type { Post, User } from "@kabsu.me/db/schema";
import {
  likes,
  notifications,
  POST_TYPE,
  posts,
  reported_posts,
} from "@kabsu.me/db/schema";

import { protectedProcedure, router } from "../trpc";

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

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      return {
        userId: ctx.session.user.id,
        post,
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

      const currentUserFromDB = await ctx.db.query.users.findFirst({
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

      const userOfPost = await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.id, input.user_id),
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

      const isFollower = await ctx.db.query.followers.findFirst({
        where: (follower, { and, eq }) =>
          and(
            eq(follower.follower_id, ctx.session.user.id),
            eq(follower.followee_id, input.user_id),
          ),
      });

      if (!currentUserFromDB || !userOfPost)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const posts = await ctx.db.query.posts.findMany({
        where: (post, { and, eq, isNull }) =>
          and(
            isNull(post.deleted_at),
            eq(post.user_id, input.user_id),

            currentUserFromDB.id !== userOfPost.id
              ? or(
                  eq(post.type, "all"),
                  currentUserFromDB.program_id === userOfPost.program_id
                    ? eq(post.type, "program")
                    : undefined,

                  currentUserFromDB.program?.college_id ===
                    userOfPost.program?.college_id
                    ? eq(post.type, "college")
                    : undefined,

                  currentUserFromDB.program?.college.campus_id ===
                    userOfPost.program?.college.campus_id
                    ? eq(post.type, "campus")
                    : undefined,

                  isFollower ? eq(post.type, "following") : undefined,
                )
              : undefined,
          ),

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

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit - 1) {
        nextCursor = input.cursor + 1;
      }

      return {
        posts,
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
      let posts: Post[] = [];

      if (input.type === "all") {
        posts = await ctx.db.query.posts.findMany({
          where: (post, { isNull, and, eq }) =>
            and(isNull(post.deleted_at), eq(post.type, "all")),
          orderBy: (post, { desc }) => desc(post.created_at),
          limit,
          offset: (input.cursor - 1) * limit,

          // with: {
          //   comments: {
          //     where: (comment, { isNull }) => isNull(comment.deleted_at),
          //   },
          //   likes: true,
          //   user: {
          //     with: {
          //       program: {
          //         with: {
          //           college: {
          //             with: {
          //               campus: true,
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
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
            eq(college.campus_id, user.program!.college.campus_id),
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
          // with: {
          //   comments: {
          //     where: (comment, { isNull }) => isNull(comment.deleted_at),
          //   },
          //   likes: true,
          //   user: {
          //     with: {
          //       program: {
          //         with: {
          //           college: {
          //             with: {
          //               campus: true,
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
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
          where: (userInDB, { eq }) =>
            eq(userInDB.program_id, user.program_id!),
        });

        const colleges = await ctx.db.query.programs.findMany({
          where: (program, { eq }) =>
            eq(program.college_id, user.program!.college_id),
        });

        const usersInColleges: User[] =
          colleges.length > 0
            ? await ctx.db.query.users.findMany({
                where: (userInDB, { inArray }) =>
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
          // with: {
          //   comments: {
          //     where: (comment, { isNull }) => isNull(comment.deleted_at),
          //   },
          //   likes: true,
          //   user: {
          //     with: {
          //       program: {
          //         with: {
          //           college: {
          //             with: {
          //               campus: true,
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
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
          where: (userInDB, { eq }) =>
            eq(userInDB.program_id, user.program_id!),
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
          // with: {
          //   comments: {
          //     where: (comment, { isNull }) => isNull(comment.deleted_at),
          //   },
          //   likes: true,
          //   user: {
          //     with: {
          //       program: {
          //         with: {
          //           college: {
          //             with: {
          //               campus: true,
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
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

        const following = await ctx.db.query.followers.findMany({
          where: (follower, { eq }) =>
            eq(follower.follower_id, ctx.session.user.id),
        });

        const users = await ctx.db.query.users.findMany({
          where: (userInDB, { inArray }) =>
            following.length
              ? inArray(
                  userInDB.id,
                  following.map((f) => f.followee_id),
                )
              : undefined,
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

        posts = await ctx.db.query.posts.findMany({
          where: (post, { or, and, eq, isNull, inArray }) =>
            and(
              isNull(post.deleted_at),
              or(
                eq(post.user_id, ctx.session.user.id),
                and(
                  following.length > 0
                    ? inArray(
                        post.user_id,
                        following.map((f) => f.followee_id),
                      )
                    : undefined,

                  or(eq(post.type, "following"), eq(post.type, "all")),
                ),
                and(
                  users.filter((u) => u.program_id === user.program_id).length >
                    0
                    ? inArray(
                        post.user_id,
                        users
                          .filter((u) => u.program_id === user.program_id)
                          .map((f) => f.id),
                      )
                    : undefined,
                  eq(post.type, "program"),
                ),
                and(
                  users.filter(
                    (u) => u.program?.college_id === user.program?.college_id,
                  ).length > 0
                    ? inArray(
                        post.user_id,
                        users
                          .filter(
                            (u) =>
                              u.program?.college_id ===
                              user.program?.college_id,
                          )
                          .map((f) => f.id),
                      )
                    : undefined,
                  eq(post.type, "college"),
                ),
                and(
                  users.filter(
                    (u) =>
                      u.program?.college.campus_id ===
                      user.program?.college.campus_id,
                  ).length > 0
                    ? inArray(
                        post.user_id,
                        users
                          .filter(
                            (u) =>
                              u.program?.college.campus_id ===
                              user.program?.college.campus_id,
                          )
                          .map((f) => f.id),
                      )
                    : undefined,
                  eq(post.type, "campus"),
                ),
              ),
            ),

          limit,
          offset: (input.cursor - 1) * limit,
          orderBy: (post, { desc }) => desc(post.created_at),
          // with: {
          //   comments: {
          //     where: (comment, { isNull }) => isNull(comment.deleted_at),
          //   },
          //   likes: true,
          //   user: {
          //     with: {
          //       program: {
          //         with: {
          //           college: {
          //             with: {
          //               campus: true,
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
        });
      }

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (posts.length > limit - 1) {
        nextCursor = input.cursor + 1;
      }

      return {
        posts,
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

      await ctx.db
        .delete(notifications)
        .where(
          and(
            eq(notifications.content_id, post.id),
            or(
              eq(notifications.type, "like"),
              eq(notifications.type, "comment"),
            ),
          ),
        );
    }),
  report: protectedProcedure
    .input(z.object({ post_id: z.string().min(1), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { and, eq }) => and(eq(posts.id, input.post_id)),
      });

      if (!post || post.deleted_at)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      if (post.user_id === ctx.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to report this post",
        });

      await ctx.db.insert(reported_posts).values({
        reason: input.reason,
        reported_by_id: ctx.session.user.id,
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

  //     return posts;
  //   }),

  like: protectedProcedure
    .input(
      z.object({
        post_id: z.string().nonempty(),
        userId: z.string().nonempty(),
      }),
    )
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

      const id = nanoid();
      await ctx.db
        .insert(likes)
        .values({ id, user_id: ctx.session.user.id, post_id: input.post_id });

      if (post.user_id !== ctx.session.user.id) {
        await ctx.db.insert(notifications).values({
          to_id: post.user_id,
          type: "like",
          from_id: ctx.session.user.id,
          content_id: post.id,
        });
      }

      const returnLike = await ctx.db.query.likes.findFirst({
        where: (likes, { and, eq }) =>
          and(eq(likes.id, id), eq(likes.user_id, ctx.session.user.id)),
      });

      if (!returnLike)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong.",
        });

      return { like: returnLike, userId: ctx.session.user.id };
    }),

  unlike: protectedProcedure
    .input(
      z.object({
        post_id: z.string().nonempty(),
        userId: z.string().nonempty(),
      }),
    )
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
              eq(notifications.content_id, input.post_id),
            ),
          );
      }

      return { like: unlike, userId: ctx.session.user.id };
    }),

  getLikesInPost: protectedProcedure
    .input(z.object({ post_id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const likes = await ctx.db.query.likes.findMany({
        where: (like, { eq }) => eq(like.post_id, input.post_id),
        with: {
          user: {
            with: {
              program: { with: { college: { with: { campus: true } } } },
            },
          },
        },
        orderBy: (like, { desc }) => desc(like.created_at),
      });

      return likes;
    }),
});
