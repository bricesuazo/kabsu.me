import type { User } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import FollowButton from "./follow-button";
import { auth } from "@clerk/nextjs";

export default function UserFollows({
  user,
  isFollower,
}: {
  user: User;
  isFollower: boolean;
}) {
  const { userId } = auth();
  return (
    <div className="flex gap-x-2 rounded border border-transparent p-2 hover:border-inherit">
      <Link href={`/${user.username}`}>
        <div className="min-w-max">
          <Image
            src={user.imageUrl}
            alt="Image"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
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
            {user.firstName} {user.lastName}
          </p>
        </div>

        {user.id !== userId && (
          <FollowButton user_id={user.id} isFollower={isFollower} />
        )}
      </div>
    </div>
  );
}
