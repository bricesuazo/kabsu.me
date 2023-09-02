import { db } from "@/db";
import { isNull } from "drizzle-orm";
import Post from "./post";

export default async function Posts() {
  const posts = await db.query.posts.findMany({
    where: (post) => isNull(post.deleted_at),
    orderBy: (post, { desc }) => desc(post.created_at),
    with: {
      user: true,
    },
  });

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
