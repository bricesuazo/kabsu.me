"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@kabsu.me/ui/alert-dialog";
import { Button } from "@kabsu.me/ui/button";

import { api } from "~/lib/trpc/client";
import { Icons } from "./icons";

export default function FollowButton({
  isFollower,
  user_id,
}: {
  isFollower: boolean;
  user_id: string;
}) {
  const params = useParams();
  const context = api.useUtils();
  const isFollowerQuery = api.users.isFollower.useQuery(
    { user_id },
    { initialData: isFollower },
  );
  const unfollowMutation = api.users.unfollow.useMutation({
    onSuccess: async () => {
      await isFollowerQuery.refetch();
      await context.users.getUserProfile.invalidate({
        username: params.username as string,
      });
      await context.posts.getUserPosts.reset();

      setOpenUnfollow(false);
    },
  });
  const followMutation = api.users.follow.useMutation({
    onSuccess: async () => {
      await isFollowerQuery.refetch();
      await context.users.getUserProfile.invalidate({
        username: params.username as string,
      });
      await context.posts.getUserPosts.reset();
    },
  });

  const [openUnfollow, setOpenUnfollow] = useState(false);

  if (isFollowerQuery.data) {
    return (
      <AlertDialog open={openUnfollow} onOpenChange={setOpenUnfollow}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            Following
          </Button>
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
                await unfollowMutation.mutateAsync({ user_id });
              }}
              disabled={unfollowMutation.isPending}
            >
              {unfollowMutation.isPending && (
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
        size="sm"
        onClick={async () => {
          await followMutation.mutateAsync({
            user_id,
          });
        }}
        disabled={followMutation.isPending}
      >
        {followMutation.isPending && (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        Follow
      </Button>
    );
  }
}
