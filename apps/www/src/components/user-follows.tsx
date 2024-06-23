import Image from "next/image";
import Link from "next/link";

import { createClient } from "~/supabase/server";
import type { Database } from "../../../../supabase/types";
import FollowButton from "./follow-button";

export default async function UserFollows({
  user,
  isFollower,
}: {
  user:
    | (Database["public"]["Tables"]["users"]["Row"] & {
        image_path: string;
        image_url: string;
      })
    | (Database["public"]["Tables"]["users"]["Row"] & { image_path: null });
  isFollower: boolean;
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div className="flex gap-x-2 rounded border border-transparent p-2 hover:border-inherit">
      <Link href={`/${user.username}`}>
        <div className="min-w-max">
          <Image
            src={user.image_path ? user.image_url : "/default-avatar.jpg"}
            alt={`${user.name} profile picture`}
            width={40}
            height={40}
            className="aspect-square rounded-full object-cover"
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
            {user.name}
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
