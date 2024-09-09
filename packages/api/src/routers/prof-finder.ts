import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const profFinderRouter = router({
  getProfPosts: protectedProcedure.query(async ({ ctx }) => {
    const { data: prof_posts, error: prof_posts_error } = await ctx.supabase
      .from("prof_posts")
      .select("*, user:users(*), prof_posts_programs(*, program:programs(*))")
      .order("created_at", { ascending: false });

    if (prof_posts_error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: prof_posts_error.message,
      });

    return prof_posts;
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
});
