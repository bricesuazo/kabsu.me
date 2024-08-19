import { authRouter } from "./routers/auth";
import { chatsRouter } from "./routers/chats";
import { commentsRouter } from "./routers/comments";
import { nglRouter } from "./routers/ngl";
import { notificationsRouter } from "./routers/notifications";
import { postsRouter } from "./routers/posts";
import { usersRouter } from "./routers/users";
import { createCallerFactory, router } from "./trpc";

export const appRouter = router({
  users: usersRouter,
  posts: postsRouter,
  comments: commentsRouter,
  notifications: notificationsRouter,
  auth: authRouter,
  chats: chatsRouter,
  ngl: nglRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
