"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { CreatePostSchema, UpdatePostSchema } from "@/zod-schema/post";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPost({ content }: CreatePostSchema) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(posts).values({ content, user_id: userId });

  revalidatePath("/");
}
export async function deletePost({ post_id }: { post_id: string }) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const post = await db.query.posts.findFirst({
    where: (posts, { and, eq }) =>
      and(eq(posts.id, post_id), eq(posts.user_id, userId)),
  });

  if (!post) throw new Error("Post not found");

  await db
    .update(posts)
    .set({ deleted_at: new Date() })
    .where(and(eq(posts.id, post_id), eq(posts.user_id, userId)));

  revalidatePath("/");
}

export async function updatePost({ content, post_id }: UpdatePostSchema) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const postFromDB = await db.query.posts.findFirst({
    where: (posts, { and, eq }) =>
      and(eq(posts.id, post_id), eq(posts.user_id, userId)),
  });

  if (!postFromDB) throw new Error("Post not found");

  await db
    .update(posts)
    .set({ content })
    .where(and(eq(posts.id, post_id), eq(posts.user_id, userId)));

  revalidatePath("/");
}
