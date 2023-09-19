import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { currentUser } from "@clerk/nextjs/server";

export const authRouter = router({
  getCurrentUser: protectedProcedure.query(() => currentUser()),
});
