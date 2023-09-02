import { db } from "@/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PostPage({
  params: { post_id },
}: {
  params: { post_id: string };
}) {
  const post = await db.query.posts.findFirst({
    where: (post, { eq }) => eq(post.id, post_id),
    with: {
      user: true,
    },
  });

  if (!post) notFound();

  return (
    <div className="container">
      <h1>{post.post}</h1>
      <Link href={`/${post.user.username}`}>{post.user.username}</Link>
    </div>
  );
}
