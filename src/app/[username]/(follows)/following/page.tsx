import { Button } from "@/components/ui/button";
import UserFollows from "@/components/user-follows";
import { db } from "@/db";
import { auth, clerkClient } from "@clerk/nextjs";
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
  const { userId } = auth();
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
      <h1>Following</h1>
      <div>
        {followeesUsers.length === 0 ? (
          <p>No following yet.</p>
        ) : (
          followeesUsers.map((followee) => (
            <UserFollows
              key={followee.id}
              user={followee}
              isFollower={
                !!followees.find((followee) => followee.follower_id === userId)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
