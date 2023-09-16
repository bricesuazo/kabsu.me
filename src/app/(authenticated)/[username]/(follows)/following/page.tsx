import UserFollows from "@/components/user-follows";
import { db } from "@/db";
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

export default async function FollowingPage({
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

  const followees = await db.query.followees.findMany({
    where: (followee, { eq }) => eq(followee.followee_id, user.id),
  });

  const followeesUsers =
    followees.length !== 0
      ? await clerkClient.users.getUserList({
          userId: followees.map((followee) => followee.follower_id),
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
          followeesUsers.map((followee) => {
            return (
              <UserFollows
                key={followee.id}
                user={followee}
                isFollower={
                  myFollowers.filter(
                    (myFollower) => myFollower.followee_id === followee.id,
                  ).length !== 0
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
