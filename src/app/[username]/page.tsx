import { db } from "@/db";
import moment from "moment";
import Link from "next/link";
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
    where: (post, { eq }) => eq(post.user_id, user.id),
    orderBy: (post, { asc }) => [asc(post.created_at)],
  });

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <h1>{post.post}</h1>
          <p>{moment(post.created_at).fromNow()}</p>
          <Link href={`/${user.username}`}>{user.username}</Link>
        </div>
      ))}
    </div>
  );
}
