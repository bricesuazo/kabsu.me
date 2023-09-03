import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { clerkClient } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateMetadata({
  params: { username },
}: {
  params: { username: string };
}): Metadata {
  return {
    title: `Followers - @${username}`,
  };
}

export default async function FollowingPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const users = await clerkClient.users.getUserList({
    username: [username],
  });

  const user = users[0];

  if (!user) notFound();

  const followees = await db.query.followees.findMany({
    where: (followee, { eq }) => eq(followee.followee_id, user.id),
  });

  const followeesUsers =
    followees.length !== 0
      ? await clerkClient.users.getUserList({
          userId: followees.map((followee) => followee.follower_id),
        })
      : [];

  return (
    <div>
      <Button asChild variant="outline">
        <Link href={`/${user.username ?? username}`}>Back</Link>
      </Button>
      <h1>Following</h1>
      <ul>
        {followeesUsers.length === 0 ? (
          <li>No following yet.</li>
        ) : (
          followeesUsers.map((followee) => (
            <li key={followee.id}>
              <a href={`/${followee.username}`}>@{followee.username}</a>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
