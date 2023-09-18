"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Icons } from "./icons";
import { toast } from "./ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/trpc/client";

export default function PostDropdown({
  post_id,
  successUrl,
}: {
  post_id: string;
  successUrl?: string;
}) {
  const context = api.useContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const deletePostMutation = api.posts.delete.useMutation({
    onSuccess: () => {
      if (successUrl) {
        router.push(successUrl);
      } else {
        router.refresh();
      }
    },
  });
  const [openDelete, setOpenDelete] = useState(false);
  // const [openUpdate, setOpenUpdate] = useState(false);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePostMutation.isLoading}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async () => {
                await deletePostMutation.mutateAsync({ post_id });
                setOpenDelete(false);
                toast({
                  title: "Post deleted",
                  description: "Your post has been deleted.",
                });
                await context.posts.getPosts.invalidate({
                  type:
                    (searchParams.get("tab") as
                      | "all"
                      | "program"
                      | "college"
                      | undefined) || "following",
                });
              }}
              disabled={deletePostMutation.isLoading}
            >
              {deletePostMutation.isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <MoreHorizontal size="1rem" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DropdownMenuLabel>Post</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem onClick={() => setOpenUpdate(true)}>
                  Edit
                </DropdownMenuItem> */}
          <DropdownMenuItem
            className="!text-red-500"
            onClick={() => setOpenDelete(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
