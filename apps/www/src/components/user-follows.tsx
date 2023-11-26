import Image from "next/image";
import Link from "next/link";

import { auth } from "@cvsu.me/auth";
import type { User } from "@cvsu.me/db/schema";

import FollowButton from "./follow-button";

export default async function UserFollows({
  user,
  isFollower,
}: {
  user: User;
  isFollower: boolean;
}) {
  const session = await auth();
  return (
    <div className="flex gap-x-2 rounded border border-transparent p-2 hover:border-inherit">
      <Link href={`/${user.username}`}>
        <div className="min-w-max">
          {user.profile_picture_url ? (
            <Image
              src={user.profile_picture_url}
              alt="Image"
              width={40}
              height={40}
              className="aspect-square rounded-full object-cover"
            />
          ) : (
            <Image
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
              alt="Image"
              width={40}
              height={40}
              className="aspect-square rounded-full object-cover"
            />
          )}
        </div>
      </Link>
      <div className="flex flex-1 justify-between gap-x-2">
        <div className="">
          <Link
            href={`/${user.username}`}
            className="line-clamp-1 flex-1 break-all font-semibold"
          >
            @{user.username}
          </Link>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {user.first_name} {user.last_name}
          </p>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {user.bio}
          </p>
        </div>

        {user.id !== session?.user.id && (
          <FollowButton user_id={user.id} isFollower={isFollower} />
        )}
      </div>
    </div>
  );
}
