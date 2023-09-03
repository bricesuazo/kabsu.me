import { Button } from "./ui/button";
import { updatePost } from "@/actions/post";
import { Icons } from "./icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdatePostSchema, updatePostSchema } from "@/zod-schema/post";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Textarea } from "./ui/textarea";
import type { Post } from "@/db/schema";
import { useEffect } from "react";

export default function UpdatePost({
  open,
  setOpen,
  post,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  post: Post;
}) {
  const form = useForm<UpdatePostSchema>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      content: post.content,
      post_id: post.id,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        content: post.content,
        post_id: post.id,
      });
    }
  }, [open, form, post.content, post.id]);

  async function onSubmit(values: UpdatePostSchema) {
    if (!form.formState.isDirty) return;

    await updatePost(values);
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Update Post</DialogTitle>
              <DialogDescription>
                This action will update your post.
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What's on your mind?" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be visible to your followers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                {form.formState.isSubmitting && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Post
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
