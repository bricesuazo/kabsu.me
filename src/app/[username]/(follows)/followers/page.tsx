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

export default async function FollowersPage({
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
      <h1>Followers</h1>
      <div>
        {followersUsers.length === 0 ? (
          <p>No followers yet.</p>
        ) : (
          followersUsers.map((follower) => (
            <UserFollows
              key={follower.id}
              user={follower}
              isFollower={
                !!followers.find((follower) => follower.follower_id === userId)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
