import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { campuses } from "@cvsu.me/db/schema";

import { protectedProcedure, router } from "../trpc";

export const adminRouter = router({
  getAllCampuses: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.campuses.findMany();
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

      await ctx.db.delete(campuses).where(eq(campuses.id, input.campus_id));
    }),
});
