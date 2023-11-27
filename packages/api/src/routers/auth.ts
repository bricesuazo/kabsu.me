import { protectedProcedure, router } from "../trpc";

export const authRouter = router({
  getCurrentSession: protectedProcedure.query(({ ctx }) => ctx.session),
});
