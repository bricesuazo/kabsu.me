import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { campuses, colleges } from "@cvsu.me/db/schema";

import { protectedProcedure, router } from "../trpc";

export const adminRouter = router({
  getAllCampuses: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.campuses.findMany({
      orderBy: (campuses, { asc }) => asc(campuses.created_at),
    });
  }),
  getCampus: protectedProcedure
    .input(z.object({ campus_id: z.string().nonempty() }))
    .query(async ({ ctx, input }) => {
      const campus = await ctx.db.query.campuses.findFirst({
        where: (campuses, { eq }) => eq(campuses.id, input.campus_id),
      });

      if (!campus)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campus not found",
        });

      const colleges = await ctx.db.query.colleges.findMany({
        where: (colleges, { eq }) => eq(colleges.campus_id, campus.id),
      });

      return {
        ...campus,
        colleges,
      };
    }),
  getAllColleges: protectedProcedure.query(async ({ ctx }) => {
    const campuses = await ctx.db.query.campuses.findMany({
      orderBy: (campuses, { asc }) => asc(campuses.created_at),
    });
    const colleges = await ctx.db.query.colleges.findMany({
      orderBy: (colleges, { asc }) => asc(colleges.created_at),
    });

    return campuses
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
      .map((campus) => ({
        ...campus,
        colleges: colleges
          .filter((college) => college.campus_id === campus.id)
          .sort((a, b) => a.created_at.getTime() - b.created_at.getTime()),
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
  addCollege: protectedProcedure
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
      const college = await ctx.db.query.colleges.findFirst({
        where: (colleges, { eq, and }) =>
          and(
            eq(colleges.campus_id, input.campus_id),
            eq(colleges.slug, input.slug),
          ),
      });

      if (college)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Campus acronym already exists",
        });

      await ctx.db.insert(colleges).values({
        campus_id: input.campus_id,
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
  deleteCollege: protectedProcedure
    .input(z.object({ college_id: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      const college = await ctx.db.query.colleges.findFirst({
        where: (colleges, { eq }) => eq(colleges.id, input.college_id),
      });

      if (!college)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campus not found",
        });

      await ctx.db.delete(colleges).where(eq(colleges.id, college.id));
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
  editCollege: protectedProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
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
      const college = await ctx.db.query.colleges.findFirst({
        where: (colleges, { eq, and }) =>
          and(
            eq(colleges.id, input.id),
            eq(colleges.campus_id, input.campus_id),
          ),
      });

      if (!college)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "College not found",
        });

      if (college.slug !== input.slug) {
        const college = await ctx.db.query.colleges.findFirst({
          where: (colleges, { eq, and }) =>
            and(
              eq(colleges.campus_id, input.campus_id),
              eq(colleges.slug, input.slug),
            ),
        });

        if (college)
          throw new TRPCError({
            code: "CONFLICT",
            message: "College acronym already exists",
          });
      }

      await ctx.db
        .update(colleges)
        .set({
          name: input.name,
        })
        .where(eq(colleges.id, input.id));
    }),
});
