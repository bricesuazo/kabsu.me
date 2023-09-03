"use client";

import { PenSquare } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Icons } from "./icons";
import { followUser, unfollowUser } from "@/actions/user";

export default function ProfileButton({
  isSameUser,
  isFollower,
  user_id,
}: {
  isSameUser: boolean;
  isFollower: boolean;
  user_id: string;
}) {
  const [loading, setLoading] = useState(false);
  if (isSameUser)
    return (
      <Button variant="secondary">
        <PenSquare size="1rem" className="mr-2" />
        Edit profile
      </Button>
    );

  return (
    <Button
      variant={isFollower ? "secondary" : "default"}
      onClick={async () => {
        setLoading(true);
        isFollower
          ? await unfollowUser({ user_id })
          : await followUser({
              user_id,
            });
        setLoading(false);
      }}
      disabled={loading}
    >
      {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}

      {isFollower ? "Following" : "Follow"}
    </Button>
  );
}
