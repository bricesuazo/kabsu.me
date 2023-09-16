"use client";

import { deleteComment } from "@/actions/post";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
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
import { toast } from "./ui/use-toast";
import { Icons } from "./icons";

export default function CommentDropdown({
  comment_id,
}: {
  comment_id: string;
}) {
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async () => {
                setLoading(true);
                await deleteComment({ comment_id });
                setLoading(false);
                setOpenDelete(false);
                toast({
                  title: "Comment deleted",
                  description: "Your comment has been deleted.",
                });
              }}
              disabled={loading}
            >
              {loading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <MoreVertical size="1rem" />
            </Button>
          </DropdownMenuTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Comment</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="!text-red-500"
            onClick={() => setOpenDelete(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
