import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

export const adminRouter = router({
  removeAllSessions: protectedProcedure.mutation(() => {
    // const sessions = await ctx.clerk.sessions.getSessionList({
    //   status: "active",
    // });
    // sessions.forEach(async (session) => {
    //   await ctx.clerk.sessions.revokeSession(session.id);
    // });
  }),
  getAllCampuses: protectedProcedure.query(async ({ ctx }) => {
    const { data: campuses } = await ctx.supabase
      .from("campuses")
      .select("id, name, slug, created_at")
      .order("created_at", { ascending: false });

    if (!campuses)
      throw new TRPCError({ code: "NOT_FOUND", message: "Campuses not found" });

    return campuses;
  }),
  getAllColleges: protectedProcedure.query(async ({ ctx }) => {
    const [{ data: campuses }, { data: colleges }] = await Promise.all([
      ctx.supabase
        .from("campuses")
        .select("id, name, slug, created_at")
        .order("created_at", { ascending: false }),
      ctx.supabase
        .from("colleges")
        .select("id, campus_id, name, slug, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (!campuses || !colleges)
      throw new TRPCError({ code: "NOT_FOUND", message: "Colleges not found" });

    return campuses
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      .map((campus) => ({
        ...campus,
        colleges: colleges
          .filter((college) => college.campus_id === campus.id)
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),
      }));
  }),
  getAllPrograms: protectedProcedure.query(async ({ ctx }) => {
    const [{ data: campuses }, { data: colleges }, { data: programs }] =
      await Promise.all([
        ctx.supabase
          .from("campuses")
          .select("id, name, slug, created_at")
          .order("created_at", { ascending: false }),
        ctx.supabase
          .from("colleges")
          .select("id, campus_id, name, slug, created_at")
          .order("created_at", { ascending: false }),
        ctx.supabase
          .from("programs")
          .select("id, college_id, name, slug, created_at")
          .order("created_at", { ascending: false }),
      ]);

    if (!campuses || !colleges || !programs)
      throw new TRPCError({ code: "NOT_FOUND", message: "Programs not found" });

    if (!campuses || !colleges || !programs)
      return campuses.map((campus) => ({
        ...campus,
        colleges: colleges
          .filter((college) => college.campus_id === campus.id)
          .map((college) => ({
            ...college,
            programs: programs.filter(
              (program) => program.college_id === college.id,
            ),
          })),
      }));
  }),
  addCampus: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, {
          message: "name must be at least 2 characters.",
        }),
        slug: z.string().min(2, {
          message: "slug must be at least 2 characters.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: campus } = await ctx.supabase
        .from("campuses")
        .select("id")
        .eq("slug", input.slug)
        .single();

      if (campus)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Campus acronym already exists",
        });

      const { error } = await ctx.supabase.from("campuses").insert({
        name: input.name,
        slug: input.slug,
      });

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Failed to add campus",
        });
    }),
  addCollege: protectedProcedure
    .input(
      z.object({
        campus_id: z.string().min(1),
        name: z.string().min(2, {
          message: "name must be at least 2 characters.",
        }),
        slug: z.string().min(2, {
          message: "slug must be at least 2 characters.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: college } = await ctx.supabase
        .from("colleges")
        .select("id")
        .eq("slug", input.slug)
        .eq("campus_id", input.campus_id)
        .single();

      if (college)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Campus acronym already exists",
        });

      const { error } = await ctx.supabase.from("colleges").insert({
        campus_id: input.campus_id,
        name: input.name,
        slug: input.slug,
      });

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Failed to add college",
        });
    }),
  addProgram: protectedProcedure
    .input(
      z.object({
        college_id: z.string().min(1),
        name: z.string().min(2, {
          message: "name must be at least 2 characters.",
        }),
        slug: z.string().min(2, {
          message: "slug must be at least 2 characters.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: program } = await ctx.supabase
        .from("programs")
        .select("id")
        .eq("college_id", input.college_id)
        .eq("slug", input.slug)
        .single();

      if (program)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Program acronym already exists",
        });

      const { error } = await ctx.supabase.from("programs").insert({
        college_id: input.college_id,
        name: input.name,
        slug: input.slug,
      });

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Failed to add program",
        });
    }),
  deleteCampus: protectedProcedure
    .input(z.object({ campus_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data: campus } = await ctx.supabase
        .from("campuses")
        .select("slug")
        .eq("id", input.campus_id)
        .single();

      if (!campus)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campus not found",
        });

      if (campus.slug === "main" || campus.slug === "ccat")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete campus",
        });

      const { error } = await ctx.supabase
        .from("campuses")
        .delete()
        .eq("id", input.campus_id);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Failed to delete campus",
        });
    }),
  deleteCollege: protectedProcedure
    .input(z.object({ college_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data: college } = await ctx.supabase
        .from("colleges")
        .select("id")
        .eq("id", input.college_id)
        .single();

      if (!college)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "College not found",
        });

      const { error } = await ctx.supabase
        .from("colleges")
        .delete()
        .eq("id", college.id);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Failed to delete college",
        });
    }),
  deleteProgram: protectedProcedure
    .input(z.object({ program_id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { data: program } = await ctx.supabase
        .from("programs")
        .select("id")
        .eq("id", input.program_id)
        .single();

      if (!program)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program not found",
        });

      await ctx.supabase.from("programs").delete().eq("id", program.id);
    }),
  editCampus: protectedProcedure
    .input(
      z.object({
        campus_id: z.string().min(1),
        name: z.string().min(2, {
          message: "name must be at least 2 characters.",
        }),
        slug: z.string().min(2, {
          message: "slug must be at least 2 characters.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: campus } = await ctx.supabase
        .from("campuses")
        .select("slug")
        .eq("id", input.campus_id)
        .single();

      if (!campus)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campus not found",
        });

      if (campus.slug === "main" && input.slug !== "main")
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot edit main campus",
        });

      const { error } = await ctx.supabase
        .from("campuses")
        .update({
          name: input.name,
          slug: input.slug,
        })
        .eq("id", input.campus_id);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Failed to edit campus",
        });
    }),
  editCollege: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        campus_id: z.string().min(1),
        name: z.string().min(2, {
          message: "name must be at least 2 characters.",
        }),
        slug: z.string().min(2, {
          message: "slug must be at least 2 characters.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: college } = await ctx.supabase
        .from("colleges")
        .select("id, slug")
        .eq("id", input.id)
        .eq("campus_id", input.campus_id)
        .single();

      if (!college)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "College not found",
        });

      if (college.slug !== input.slug) {
        const { data: college } = await ctx.supabase
          .from("colleges")
          .select("id")
          .eq("campus_id", input.campus_id)
          .eq("slug", input.slug)
          .single();

        if (college)
          throw new TRPCError({
            code: "CONFLICT",
            message: "College acronym already exists",
          });
      }

      const { error } = await ctx.supabase
        .from("colleges")
        .update({
          name: input.name,
        })
        .eq("id", input.id);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Failed to edit college",
        });
    }),
  editProgram: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        college_id: z.string().min(1),
        name: z.string().min(2, {
          message: "name must be at least 2 characters.",
        }),
        slug: z.string().min(2, {
          message: "slug must be at least 2 characters.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data: program } = await ctx.supabase
        .from("programs")
        .select("id, slug")
        .eq("id", input.id)
        .eq("college_id", input.college_id)
        .single();

      if (!program)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "College not found",
        });

      if (program.slug !== input.slug) {
        const { data: program } = await ctx.supabase
          .from("programs")
          .select("id")
          .eq("college_id", input.college_id)
          .eq("slug", input.slug)
          .single();

        if (program)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Program acronym already exists",
          });
      }

      const { error } = await ctx.supabase
        .from("programs")
        .update({
          name: input.name,
          slug: input.slug,
        })
        .eq("id", input.id);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Failed to edit program",
        });
    }),
});
