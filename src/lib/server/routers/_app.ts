import { postsRouter } from "./posts";
import { usersRouter } from "./users";
import { commentsRouter } from "./comments";
import { router } from "../trpc";
import { notificationsRouter } from "./notifications";

export const appRouter = router({
  users: usersRouter,
  posts: postsRouter,
  comments: commentsRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
