"use server";

import { clerkClient } from "@clerk/nextjs";

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
