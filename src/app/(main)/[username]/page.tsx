import Post from "@/components/post";
import { db } from "@/db";
import { clerkClient } from "@clerk/nextjs";
import { isNull } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const users = await clerkClient.users.getUserList({
    username: [username],
  });

  const user = users[0];

  if (!user) notFound();

  const posts = await db.query.posts.findMany({
    where: (post) => isNull(post.deleted_at),
    orderBy: (post, { asc }) => [asc(post.created_at)],
    with: {
      user: true,
    },
  });

  const usersFromPosts = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.user.id),
  });

  return (
    <div>
      {posts.map((post) => (
        <Post
          key={post.id}
          post={{
            ...post,
            user: usersFromPosts.find((user) => user.id === post.user.id)!,
          }}
          userId={user.id}
        />
      ))}
    </div>
  );
}
