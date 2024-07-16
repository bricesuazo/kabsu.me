import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { authRouter } from "./routers/auth";
import { chatsRouter } from "./routers/chats";
import { commentsRouter } from "./routers/comments";
import { notificationsRouter } from "./routers/notifications";
import { postsRouter } from "./routers/posts";
import { usersRouter } from "./routers/users";
import { router } from "./trpc";

export const appRouter = router({
  users: usersRouter,
  posts: postsRouter,
  comments: commentsRouter,
  notifications: notificationsRouter,
  auth: authRouter,
  chats: chatsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
