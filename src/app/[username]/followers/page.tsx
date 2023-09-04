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

export default async function FollowersPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const users = await clerkClient.users.getUserList({
    username: [username],
  });

  const user = users[0];

  if (!user) notFound();

  const followers = await db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.followee_id, user.id),
  });

  const followersUsers =
    followers.length !== 0
      ? await clerkClient.users.getUserList({
          userId: followers.map((follower) => follower.follower_id),
        })
      : [];

  return (
    <div>
      <Button asChild variant="outline">
        <Link href={`/${user.username ?? username}`}>Back</Link>
      </Button>
      <h1>Followers</h1>
      <ul>
        {followersUsers.length === 0 ? (
          <li>No followers yet.</li>
        ) : (
          followersUsers.map((follower) => (
            <li key={follower.id}>
              <a href={`/${follower.username}`}>@{follower.username}</a>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
