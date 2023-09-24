import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UserFollows from "@/components/user-follows";
import { auth, clerkClient } from "@clerk/nextjs";

import { db } from "@cvsu.me/db";

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
    orderBy: (follower, { asc }) => asc(follower.created_at),
  });

  const myFollowees = await db.query.followees.findMany({
    where: (followee, { eq }) => eq(followee.followee_id, userId),
  });

  const followersUsers =
    followers.length !== 0
      ? await clerkClient.users.getUserList({
          userId: followers.map((follower) => follower.follower_id),
          limit: followers.length,
        })
      : [];

  return (
    <div>
      <p className="text-center text-sm text-muted-foreground">Followers</p>
      {followersUsers.length === 0 ? (
        <p className="text-center">No followers yet.</p>
      ) : (
        followers
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
          .map((follower) => {
            const followerUser = followersUsers.find(
              (user) => user.id === follower.follower_id,
            );

            if (!followerUser) return null;

            return (
              <UserFollows
                key={followerUser.id}
                user={followerUser}
                isFollower={myFollowees.some(
                  (followee) => followee.followee_id === followerUser.id,
                )}
              />
            );
          })
      )}
    </div>
  );
}
