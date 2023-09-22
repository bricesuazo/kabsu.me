import UserFollows from "@/components/user-follows";
import { db } from "@cvsu.me/db";
import { auth, clerkClient } from "@clerk/nextjs";
import type { Metadata } from "next";
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

  if (!userId) notFound();

  const users = await clerkClient.users.getUserList({
    username: [username],
  });

  const user = users[0];

  if (!user) notFound();

  const followers = await db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.followee_id, user.id),
  });

  const myFollowees = await db.query.followees.findMany({
    where: (followee, { eq }) => eq(followee.followee_id, userId),
  });

  const followersUsers =
    followers.length !== 0
      ? await clerkClient.users.getUserList({
          userId: followers.map((follower) => follower.follower_id),
        })
      : [];

  return (
    <div>
      <p className="text-center text-sm text-muted-foreground">Followers</p>
      {followersUsers.length === 0 ? (
        <p className="text-center">No followers yet.</p>
      ) : (
        followersUsers.map((follower) => (
          <UserFollows
            key={follower.id}
            user={follower}
            isFollower={
              myFollowees.filter(
                (followee) => followee.follower_id === follower.id,
              ).length !== 0
            }
          />
        ))
      )}
    </div>
  );
}
