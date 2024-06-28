"use client";

import type { RouterInputs, RouterOutputs } from "@kabsu.me/api";

import UserFollows from "~/components/user-follows";
import { api } from "~/lib/trpc/client";

export default function Following(props: {
  input: RouterInputs["users"]["getAllFollowings"];
  output: RouterOutputs["users"]["getAllFollowings"];
  user_id: string;
}) {
  const getAllFollowingsQuery = api.users.getAllFollowings.useQuery(
    props.input,
    { initialData: props.output },
  );
  return (
    <div>
      <p className="text-center text-sm text-muted-foreground">Following</p>
      <div>
        {getAllFollowingsQuery.data.followeesUsers.length === 0 ? (
          <p className="text-center">No following yet.</p>
        ) : (
          getAllFollowingsQuery.data.followees
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
            .map((followee) => {
              const followee_user =
                getAllFollowingsQuery.data.followeesUsers.find(
                  (user) => user.id === followee.follower_id,
                );

              if (!followee_user) return null;

              return (
                <UserFollows
                  key={followee_user.id}
                  user={followee_user}
                  user_id={props.user_id}
                  isFollower={getAllFollowingsQuery.data.my_followers.some(
                    (follower) => follower.follower_id === followee_user.id,
                  )}
                />
              );
            })
        )}
      </div>
    </div>
  );
}
