import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UserFollows from "@/components/user-follows";
import { auth } from "@clerk/nextjs";

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

export default async function FollowingPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const { userId } = auth();

  if (!userId) notFound();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  });

  if (!user) notFound();

  const followees = await db.query.followees.findMany({
    where: (followee, { eq }) => eq(followee.followee_id, user.id),
  });

  const followeesUsers =
    followees.length !== 0
      ? await db.query.users.findMany({
          where: (user, { inArray }) =>
            inArray(
              user.id,
              followees.map((f) => f.follower_id),
            ),
        })
      : [];

  // TODO: This is a hacky way to get the followers of the user
  const myFollowers = await db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.follower_id, userId),
  });

  return (
    <div>
      <p className="text-center text-sm text-muted-foreground">Following</p>
      <div>
        {followeesUsers.length === 0 ? (
          <p className="text-center">No following yet.</p>
        ) : (
          followees
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
            .map((followee) => {
              const followeeUser = followeesUsers.find(
                (user) => user.id === followee.follower_id,
              );

              if (!followeeUser) return null;

              return (
                <UserFollows
                  key={followeeUser.id}
                  user={followeeUser}
                  isFollower={
                    myFollowers.some(
                      (follower) => follower.followee_id === followeeUser.id,
                    ) ?? false
                  }
                />
              );
            })
        )}
      </div>
    </div>
  );
}
