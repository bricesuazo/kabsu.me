import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UserFollows from "@/components/user-follows";

import { auth } from "@kabsu.me/auth";
import { db } from "@kabsu.me/db";

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
  const session = await auth();

  if (!session) notFound();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  });

  if (!user) notFound();

  const followers = await db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.followee_id, user.id),
    orderBy: (follower, { asc }) => asc(follower.created_at),
  });

  const myFollowees = await db.query.followees.findMany({
    where: (followee, { eq }) => eq(followee.followee_id, session.user.id),
  });

  const followersUsers =
    followers.length !== 0
      ? await db.query.users.findMany({
          where: (user, { inArray }) =>
            inArray(
              user.id,
              followers.map((f) => f.follower_id),
            ),
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
                isFollower={
                  myFollowees.some(
                    (followee) => followee.follower_id === followerUser.id,
                  ) ?? false
                }
              />
            );
          })
      )}
    </div>
  );
}
