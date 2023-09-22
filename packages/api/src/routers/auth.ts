import { currentUser } from "@clerk/nextjs/server";

import { protectedProcedure, router } from "../trpc";

export const authRouter = router({
  getCurrentUser: protectedProcedure.query(() => currentUser()),
});
