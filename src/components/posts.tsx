import { db } from "@/db";
import { isNull } from "drizzle-orm";
import moment from "moment";
import Link from "next/link";

export default async function Posts() {
  const posts = await db.query.posts.findMany({
    where: (post) => isNull(post.deleted_at),
    orderBy: (post, { desc }) => desc(post.created_at),
    with: {
      user: true,
    },
  });

  return (
    <div>
      {posts.map((post) => (
        <Link href={`/${post.user.username}/${post.id}`} key={post.id}>
          <h2>{post.post}</h2>
          <p>{moment(post.created_at).fromNow()}</p>
        </Link>
      ))}
    </div>
  );
}
