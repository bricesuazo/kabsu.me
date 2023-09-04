import { db } from "@/db";
import { clerkClient } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { username: string; post_id: string };
}): Promise<Metadata> {
  const post = await db.query.posts.findFirst({
    where: (post, { eq }) => eq(post.id, params.post_id),
    with: {
      user: true,
    },
  });

  if (!post) notFound();

  return {
    title: `${post.content} - @${params.username}`,
  };
}

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

  const user = await clerkClient.users.getUser(post.user.id);

  return (
    <div className="container">
      <h1>{post.content}</h1>
      <Link href={`/${user.username}`}>{user.username}</Link>
    </div>
  );
}
