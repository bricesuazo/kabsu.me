import { postsRouter } from "./posts";
import { usersRouter } from "./users";
import { commentsRouter } from "./comments";
import { router } from "../trpc";
import { notificationsRouter } from "./notifications";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { authRouter } from "./auth";

export const appRouter = router({
  users: usersRouter,
  posts: postsRouter,
  comments: commentsRouter,
  notifications: notificationsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
