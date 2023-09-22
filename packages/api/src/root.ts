import { postsRouter } from "./routers/posts";
import { usersRouter } from "./routers/users";
import { commentsRouter } from "./routers/comments";
import { router } from "./trpc";
import { notificationsRouter } from "./routers/notifications";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { authRouter } from "./routers/auth";

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
