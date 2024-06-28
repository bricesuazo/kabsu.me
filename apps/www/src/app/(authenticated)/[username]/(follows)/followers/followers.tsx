"use client";

import type { RouterInputs, RouterOutputs } from "@kabsu.me/api";

import UserFollows from "~/components/user-follows";
import { api } from "~/lib/trpc/client";

export default function Followers(props: {
  input: RouterInputs["users"]["getAllFollowers"];
  output: RouterOutputs["users"]["getAllFollowers"];
  user_id: string;
}) {
  const getAllFollowersQuery = api.users.getAllFollowers.useQuery(props.input, {
    initialData: props.output,
  });
  return (
    <div>
      <p className="text-center text-sm text-muted-foreground">Followers</p>
      {getAllFollowersQuery.data.followersUsers.length === 0 ? (
        <p className="text-center">No followers yet.</p>
      ) : (
        getAllFollowersQuery.data.followers
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .map((follower) => {
            const followerUser = getAllFollowersQuery.data.followersUsers.find(
              (user) => user.id === follower.follower_id,
            );

            if (!followerUser) return null;

            return (
              <UserFollows
                key={followerUser.id}
                user={followerUser}
                user_id={props.user_id}
                isFollower={getAllFollowersQuery.data.my_followees.some(
                  (followee) => followee.follower_id === followerUser.id,
                )}
              />
            );
          })
      )}
    </div>
  );
}
