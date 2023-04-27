import { notes } from "@cvsudotme/db";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getNotes: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(notes);
  }),
  getMessageFromServer: publicProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @cvsudotme/auth package
    return "this message is from server!";
  }),
  getSecretMessage: protectedProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @cvsudotme/auth package
    return "you can see this secret message!";
  }),
});
