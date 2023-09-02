import Post from "@/components/post";
import { db } from "@/db";
import { isNull } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  });

  if (!user) notFound();

  const posts = await db.query.posts.findMany({
    where: (post) => isNull(post.deleted_at),
    orderBy: (post, { asc }) => [asc(post.created_at)],
    with: {
      user: true,
    },
  });

  return (
    <div>
      {posts.map((post) => (
        <Post key={post.id} post={post} userId={user.id} />
      ))}
    </div>
  );
}
