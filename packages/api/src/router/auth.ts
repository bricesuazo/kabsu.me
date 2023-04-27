import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getMessageFromServer: publicProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @cvsudotme/auth package
    return "this message is from server!";
  }),
  getMessageFromServer2: publicProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @cvsudotme/auth package
    return "this message is from server2!";
  }),
  getSecretMessage: protectedProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @cvsudotme/auth package
    return "you can see this secret message!";
  }),
});
