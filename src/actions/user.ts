"use server";

import { db } from "@/db";
import { followers, following } from "@/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addProgramToUserMetadata({
  userId,
  program_id,
}: {
  userId: string;
  program_id: string;
}) {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      program_id,
    },
  });
}

export async function updateBio({
  user_id,
  bio,
}: {
  user_id: string;
  bio: string;
}) {
  const { userId } = auth();

  if (!userId || userId !== user_id) throw new Error("User not found");

  await clerkClient.users.updateUserMetadata(user_id, {
    publicMetadata: {
      bio,
    },
  });
  revalidatePath("/user/[username]");
}

export async function followUser({ user_id }: { user_id: string }) {
  const { userId } = auth();

  if (!userId) throw new Error("User not found");

  await db.insert(followers).values({
    user_id,
    follower_id: userId,
  });

  await db.insert(following).values({
    user_id: userId,
    following_id: user_id,
  });
  revalidatePath("/user/[username]");
}
