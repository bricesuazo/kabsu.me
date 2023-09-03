import { db } from "@/db";
import { isNull } from "drizzle-orm";
import Post from "./post";
import { auth, clerkClient } from "@clerk/nextjs";

export default async function Posts() {
  const { userId } = auth();
  const posts = await db.query.posts.findMany({
    where: (post, { and, eq }) =>
      and(isNull(post.deleted_at), eq(post.user_id, userId ?? "")),
    orderBy: (post, { desc }) => desc(post.created_at),
    with: {
      user: true,
    },
  });

  const usersFromPosts = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.user && post.user.id),
  });

  return (
    <div className="flex flex-col">
      {posts.map((post) => {
        if (!post.user) return null;
        return (
          <Post
            key={post.id}
            post={{
              ...post,
              user: usersFromPosts.find((user) => user.id === post.user.id)!,
            }}
            userId={userId}
          />
        );
      })}
    </div>
  );
}
