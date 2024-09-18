"use client";

import Image from "next/image";
import Link from "next/link";

import type { RouterOutputs } from "@kabsu.me/api";

import FollowButton from "./follow-button";

export default function UserFollows({
  user,
  isFollower,
  user_id,
}: {
  user:
    | RouterOutputs["users"]["getAllFollowers"]["followersUsers"][number]
    | RouterOutputs["users"]["getAllFollowings"]["followeesUsers"][number];
  isFollower: boolean;
  user_id: string;
}) {
  return (
    <div className="flex gap-x-2 rounded border border-transparent p-2 hover:border-inherit">
      <Link href={`/${user.username}`}>
        <div className="min-w-max">
          <Image
            src={user.image_name ? user.image_url : "/default-avatar.webp"}
            alt={`${user.name} profile picture`}
            width={40}
            height={40}
            className="aspect-square rounded-full object-cover object-center"
          />
        </div>
      </Link>
      <div className="flex flex-1 justify-between gap-x-2">
        <div>
          <Link
            href={`/${user.username}`}
            className="line-clamp-1 flex-1 break-all font-semibold"
          >
            @{user.username}
          </Link>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {user.name}
          </p>
          <p className="line-clamp-2 break-all text-sm text-muted-foreground">
            {user.bio}
          </p>
        </div>

        {user.id !== user_id && (
          <FollowButton user_id={user.id} isFollower={isFollower} />
        )}
      </div>
    </div>
  );
}
