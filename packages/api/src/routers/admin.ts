import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { campuses } from "@cvsu.me/db/schema";

import { protectedProcedure, router } from "../trpc";

export const adminRouter = router({
  getAllCampuses: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.campuses.findMany();
  }),
  getAllColleges: protectedProcedure.query(async ({ ctx }) => {
    const campuses = await ctx.db.query.campuses.findMany();
    const colleges = await ctx.db.query.colleges.findMany();

    return campuses.map((campus) => ({
      ...campus,
      colleges: colleges.filter((college) => college.campus_id === campus.id),
    }));
  }),
  getAllPrograms: protectedProcedure.query(async ({ ctx }) => {
    const colleges = await ctx.db.query.colleges.findMany();
    const campuses = await ctx.db.query.campuses.findMany();
    const programs = await ctx.db.query.programs.findMany();

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
      const campus = await ctx.db.query.campuses.findFirst({
        where: (campuses, { eq }) => eq(campuses.slug, input.slug),
      });

      if (campus)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Campus acronym already exists",
        });

      await ctx.db.insert(campuses).values({
        name: input.name,
        slug: input.slug,
      });
    }),
  deleteCampus: protectedProcedure
    .input(z.object({ campus_id: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      const campus = await ctx.db.query.campuses.findFirst({
        where: (campuses, { eq }) => eq(campuses.id, input.campus_id),
      });

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

      await ctx.db.delete(campuses).where(eq(campuses.id, input.campus_id));
    }),
  editCampus: protectedProcedure
    .input(
      z.object({
        campus_id: z.string().nonempty(),
        name: z.string().min(2, {
          message: "name must be at least 2 characters.",
        }),
        slug: z.string().min(2, {
          message: "slug must be at least 2 characters.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const campus = await ctx.db.query.campuses.findFirst({
        where: (campuses, { eq }) => eq(campuses.id, input.campus_id),
      });

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

      await ctx.db
        .update(campuses)
        .set({
          name: input.name,
          slug: input.slug,
        })
        .where(eq(campuses.id, input.campus_id));
    }),
});
