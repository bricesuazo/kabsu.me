import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import FollowButton from "./follow-button";

export default function UserFollows({
  user,
  isFollower,
}: {
  user: User;
  isFollower: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-x-2">
        <div className="w-max">
          <Image
            src={user.imageUrl}
            alt="Image"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </div>
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
          <FollowButton user_id={user.id} isFollower={isFollower} />
        </div>
      </div>

      <p className="">{user.publicMetadata.bio as string}</p>
    </div>
  );
}
