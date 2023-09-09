import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { deletePost } from "@/actions/post";
import { Icons } from "./icons";
import { toast } from "./ui/use-toast";

export default function DeletePost({
  open,
  setOpen,
  post_id,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  post_id: string;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* <AlertDialogAction asChild> */}
          <Button
            variant="destructive"
            onClick={async () => {
              setLoading(true);
              await deletePost({ post_id });
              setLoading(false);
              setOpen(false);
              toast({
                title: "Post deleted",
                description: "Your post has been deleted.",
              });
            }}
            disabled={loading}
          >
            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
          {/* </AlertDialogAction> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
