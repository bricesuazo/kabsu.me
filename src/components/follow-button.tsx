"use client";

import { Button } from "./ui/button";
import { useState } from "react";
import { Icons } from "./icons";
import { followUser, unfollowUser } from "@/actions/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export default function FollowButton({
  isFollower,
  user_id,
}: {
  isFollower: boolean;
  user_id: string;
}) {
  const [loading, setLoading] = useState(false);
  const [openUnfollow, setOpenUnfollow] = useState(false);

  if (isFollower) {
    return (
      <AlertDialog open={openUnfollow} onOpenChange={setOpenUnfollow}>
        <AlertDialogTrigger asChild>
          <Button>Following</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to unfollow?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer see their posts on your feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              onClick={async () => {
                setLoading(true);
                await unfollowUser({ user_id });

                setOpenUnfollow(false);

                setLoading(false);
              }}
              disabled={loading}
            >
              {loading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Unfollow
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  } else {
    return (
      <Button
        variant="default"
        onClick={async () => {
          setLoading(true);

          await followUser({
            user_id,
          });
          setLoading(false);
        }}
        disabled={loading}
      >
        {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Follow
      </Button>
    );
  }
}
