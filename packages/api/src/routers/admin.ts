import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { campuses, colleges, programs } from "@cvsu.me/db/schema";

import { protectedProcedure, router } from "../trpc";

export const adminRouter = router({
  removeAllSessions: protectedProcedure.mutation(async ({ ctx }) => {
    const sessions = await ctx.clerk.sessions.getSessionList({
      status: "active",
    });

    sessions.forEach(async (session) => {
      await ctx.clerk.sessions.revokeSession(session.id);
    });
  }),
  getAllCampuses: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.campuses.findMany({
      orderBy: (campuses, { desc }) => desc(campuses.created_at),
    });
  }),
  getAllColleges: protectedProcedure.query(async ({ ctx }) => {
    const campuses = await ctx.db.query.campuses.findMany({
      orderBy: (campuses, { desc }) => desc(campuses.created_at),
    });
    const colleges = await ctx.db.query.colleges.findMany({
      orderBy: (colleges, { desc }) => desc(colleges.created_at),
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
    const colleges = await ctx.db.query.colleges.findMany({
      orderBy: (colleges, { desc }) => desc(colleges.created_at),
    });
    const campuses = await ctx.db.query.campuses.findMany({
      orderBy: (campuses, { desc }) => desc(campuses.created_at),
    });
    const programs = await ctx.db.query.programs.findMany({
      orderBy: (programs, { desc }) => desc(programs.created_at),
    });

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
  addProgram: protectedProcedure
    .input(
      z.object({
        college_id: z.string().nonempty(),
        name: z.string().min(2, {
          message: "name must be at least 2 characters.",
        }),
        slug: z.string().min(2, {
          message: "slug must be at least 2 characters.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.query.programs.findFirst({
        where: (programs, { eq, and }) =>
          and(
            eq(programs.college_id, input.college_id),
            eq(programs.slug, input.slug),
          ),
      });

      if (program)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Program acronym already exists",
        });

      await ctx.db.insert(programs).values({
        college_id: input.college_id,
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
          message: "College not found",
        });

      await ctx.db.delete(colleges).where(eq(colleges.id, college.id));
    }),
  deleteProgram: protectedProcedure
    .input(z.object({ program_id: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.query.programs.findFirst({
        where: (programs, { eq }) => eq(programs.id, input.program_id),
      });

      if (!program)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program not found",
        });

      await ctx.db.delete(programs).where(eq(programs.id, program.id));
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
  editProgram: protectedProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
        college_id: z.string().nonempty(),
        name: z.string().min(2, {
          message: "name must be at least 2 characters.",
        }),
        slug: z.string().min(2, {
          message: "slug must be at least 2 characters.",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.query.programs.findFirst({
        where: (programs, { eq, and }) =>
          and(
            eq(programs.id, input.id),
            eq(programs.college_id, input.college_id),
          ),
      });

      if (!program)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "College not found",
        });

      if (program.slug !== input.slug) {
        const program = await ctx.db.query.programs.findFirst({
          where: (programs, { eq, and }) =>
            and(
              eq(programs.college_id, input.college_id),
              eq(programs.slug, input.slug),
            ),
        });

        if (program)
          throw new TRPCError({
            code: "CONFLICT",
            message: "Program acronym already exists",
          });
      }

      await ctx.db
        .update(programs)
        .set({
          name: input.name,
          slug: input.slug,
        })
        .where(eq(programs.id, input.id));
    }),
});
