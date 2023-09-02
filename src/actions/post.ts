"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { CreatePostSchema } from "@/zod-schema/post";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

export async function createPost({ post }: CreatePostSchema) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(posts).values({ post, user_id: userId });

  revalidatePath("/");
}
