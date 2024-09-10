import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { Database } from "../../../../supabase/types";
import { protectedProcedure, router } from "../trpc";

export const profFinderRouter = router({
  getProfPosts: protectedProcedure
    .input(
      z.object({
        filter: z.custom<Database["public"]["Enums"]["global_chat_type"]>(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.filter === "program") {
        const { data: current_user, error: current_user_error } =
          await ctx.supabase
            .from("users")
            .select("program_id")
            .eq("id", ctx.auth.user.id)
            .single();

        if (current_user_error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: current_user_error.message,
          });

        const { data: prof_posts, error: prof_posts_error } = await ctx.supabase
          .from("prof_posts")
          .select(
            "*, user:users!inner(*), prof_posts_programs!inner(*, program:programs!inner(*))",
          )
          .order("created_at", { ascending: false })
          .eq("users.type", "faculty")
          .is("archived_at", null)
          .is("prof_posts_programs.archived_at", null)
          .eq("prof_posts_programs.program_id", current_user.program_id);

        if (prof_posts_error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: prof_posts_error.message,
          });

        return prof_posts
          .filter((prof_post) => prof_post.prof_posts_programs.length)
          .map((prof_post) => {
            let image_url: string | null = null;
            if (
              prof_post.user.image_name &&
              !prof_post.user.image_name.startsWith("https")
            ) {
              const { data } = ctx.supabase.storage
                .from("avatars")
                .getPublicUrl(
                  "users/" +
                    prof_post.user.id +
                    "/" +
                    prof_post.user.image_name,
                );
              image_url = data.publicUrl;
            }
            return {
              ...prof_post,
              user: {
                ...prof_post.user,
                ...(prof_post.user.image_name?.startsWith("https:")
                  ? {
                      image_name: prof_post.user.image_name,
                      image_url: prof_post.user.image_name,
                    }
                  : prof_post.user.image_name && image_url
                    ? {
                        image_name: prof_post.user.image_name,
                        image_url,
                      }
                    : {
                        image_name: null,
                      }),
              },
            };
          });
      } else if (input.filter === "college") {
        const { data: current_user, error: current_user_error } =
          await ctx.supabase
            .from("users")
            .select("program:programs!inner(college_id)")
            .eq("id", ctx.auth.user.id)
            .single();

        if (current_user_error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: current_user_error.message,
          });

        const { data: prof_posts, error: prof_posts_error } = await ctx.supabase
          .from("prof_posts")
          .select(
            "*, user:users!inner(*), prof_posts_programs!inner(*, program:programs!inner(*))",
          )
          .order("created_at", { ascending: false })
          .eq("users.type", "faculty")
          .eq(
            "prof_posts_programs.programs.college_id",
            current_user.program.college_id,
          );

        if (prof_posts_error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: prof_posts_error.message,
          });

        return prof_posts
          .filter((prof_post) => prof_post.prof_posts_programs.length)
          .map((prof_post) => {
            let image_url: string | null = null;
            if (
              prof_post.user.image_name &&
              !prof_post.user.image_name.startsWith("https")
            ) {
              const { data } = ctx.supabase.storage
                .from("avatars")
                .getPublicUrl(
                  "users/" +
                    prof_post.user.id +
                    "/" +
                    prof_post.user.image_name,
                );
              image_url = data.publicUrl;
            }
            return {
              ...prof_post,
              user: {
                ...prof_post.user,
                ...(prof_post.user.image_name?.startsWith("https:")
                  ? {
                      image_name: prof_post.user.image_name,
                      image_url: prof_post.user.image_name,
                    }
                  : prof_post.user.image_name && image_url
                    ? {
                        image_name: prof_post.user.image_name,
                        image_url,
                      }
                    : {
                        image_name: null,
                      }),
              },
            };
          });
      } else if (input.filter === "campus") {
        const { data: current_user, error: current_user_error } =
          await ctx.supabase
            .from("users")
            .select("program:programs!inner(college:colleges!inner(campus_id))")
            .eq("id", ctx.auth.user.id)
            .single();

        if (current_user_error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: current_user_error.message,
          });

        const { data: prof_posts, error: prof_posts_error } = await ctx.supabase
          .from("prof_posts")
          .select(
            "*, user:users!inner(*), prof_posts_programs!inner(*, program:programs!inner(*, colleges!inner(campus_id)))",
          )
          .order("created_at", { ascending: false })
          .eq("users.type", "faculty")
          .eq(
            "prof_posts_programs.programs.colleges.campus_id",
            current_user.program.college.campus_id,
          );

        if (prof_posts_error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: prof_posts_error.message,
          });

        return prof_posts
          .filter((prof_post) => prof_post.prof_posts_programs.length)
          .map((prof_post) => {
            let image_url: string | null = null;
            if (
              prof_post.user.image_name &&
              !prof_post.user.image_name.startsWith("https")
            ) {
              const { data } = ctx.supabase.storage
                .from("avatars")
                .getPublicUrl(
                  "users/" +
                    prof_post.user.id +
                    "/" +
                    prof_post.user.image_name,
                );
              image_url = data.publicUrl;
            }
            return {
              ...prof_post,
              user: {
                ...prof_post.user,
                ...(prof_post.user.image_name?.startsWith("https:")
                  ? {
                      image_name: prof_post.user.image_name,
                      image_url: prof_post.user.image_name,
                    }
                  : prof_post.user.image_name && image_url
                    ? {
                        image_name: prof_post.user.image_name,
                        image_url,
                      }
                    : {
                        image_name: null,
                      }),
              },
            };
          });
      }

      return [];
    }),
  createProfPost: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        programs: z
          .object({
            id: z.string(),
            section: z.string().transform((val) => parseInt(val)),
            year: z.string().transform((val) => parseInt(val)),
          })
          .array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: current_user, error: current_user_error } =
        await ctx.supabase
          .from("users")
          .select("type")
          .eq("id", ctx.auth.user.id)
          .single();

      if (current_user_error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: current_user_error.message,
        });

      if (current_user.type !== "faculty")
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to create a prof post.",
        });

      const { data: prof_post, error: prof_post_error } = await ctx.supabase
        .from("prof_posts")
        .insert({
          description: input.description,
          user_id: ctx.auth.user.id,
        })
        .select("id")
        .single();

      if (prof_post_error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: prof_post_error.message,
        });

      const { error: prof_post_programs_error } = await ctx.supabase
        .from("prof_posts_programs")
        .insert(
          input.programs.map((program) => ({
            prof_post_id: prof_post.id,
            program_id: program.id,
            section: program.section,
            year: program.year,
          })),
        );

      if (prof_post_programs_error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: prof_post_programs_error.message,
        });
    }),
  getAllPrograms: protectedProcedure.query(async ({ ctx }) => {
    const { data: programs, error: programs_error } = await ctx.supabase
      .from("programs")
      .select("id, name, slug");

    if (programs_error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: programs_error.message,
      });

    return programs;
  }),
  archiveProfPost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error: prof_post_error } = await ctx.supabase
        .from("prof_posts")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", input.id)
        .eq("user_id", ctx.auth.user.id);

      if (prof_post_error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: prof_post_error.message,
        });
    }),
  editProfPost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string(),
        programsToDelete: z.string().array(),
        programs: z
          .object({
            id: z.string(),
            section: z.string(),
            year: z.string(),
          })
          .array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("prof_posts")
        .update({ description: input.description })
        .eq("id", input.id)
        .eq("user_id", ctx.auth.user.id);

      for (const programToDelete of input.programsToDelete) {
        const { error } = await ctx.supabase
          .from("prof_posts_programs")
          .update({ archived_at: new Date().toISOString() })
          .eq("id", programToDelete);

        if (error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
      }

      await ctx.supabase
        .from("prof_posts_programs")
        .upsert(
          input.programs.map((program) => ({
            id: program.id,
            prof_post_id: input.id,
            program_id: program.id,
            section: parseInt(program.section),
            year: parseInt(program.year),
          })),
        )
        .eq("prof_post_id", input.id);
    }),
});
