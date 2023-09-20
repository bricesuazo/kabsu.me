"use client";

import { Button } from "./ui/button";
import { useContext, useState } from "react";
import { Icons } from "./icons";
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
import { api } from "@/lib/trpc/client";
import { useParams } from "next/navigation";

export default function FollowButton({
  isFollower,
  user_id,
}: {
  isFollower: boolean;
  user_id: string;
}) {
  const params = useParams();
  const context = api.useContext();
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

      setOpenUnfollow(false);
    },
  });
  const followMutation = api.users.follow.useMutation({
    onSuccess: async () => {
      await isFollowerQuery.refetch();
      await context.users.getUserProfile.invalidate({
        username: params.username as string,
      });
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
              disabled={unfollowMutation.isLoading}
            >
              {unfollowMutation.isLoading && (
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
        disabled={followMutation.isLoading}
      >
        {followMutation.isLoading && (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        Follow
      </Button>
    );
  }
}
