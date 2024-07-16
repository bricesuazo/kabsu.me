"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { REPORT_POST_REASONS } from "@kabsu.me/constants";

import { api } from "~/lib/trpc/client";
import { Icons } from "./icons";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "./ui/use-toast";

export default function PostDropdown({
  post_id,
  successUrl,
  isMyPost,
}: {
  post_id: string;
  successUrl?: string;
  isMyPost: boolean;
}) {
  const context = api.useUtils();
  const searchParams = useSearchParams();
  const router = useRouter();
  const deletePostMutation = api.posts.delete.useMutation({
    onSuccess: async () => {
      if (successUrl) {
        router.push(successUrl);
      } else {
        await Promise.all([
          context.posts.getUserPosts.reset(),
          context.posts.getPosts.reset(),
        ]);
        // router.refresh();
      }
    },
  });
  const reportPostMutation = api.posts.report.useMutation({
    onSuccess: () => {
      setOpenReport(false);
      toast({
        title: "Post reported",
        description: "Your report has been submitted",
      });
    },
  });
  const reportForm = useForm<{
    id: string;
    reason: string;
  }>({
    resolver: zodResolver(
      z.object({
        id: z.string().min(1, "Please select a reason for your report."),
        reason: z.string(),
      }),
    ),
    defaultValues: {
      reason: "",
    },
  });

  const [openDelete, setOpenDelete] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  // const [openUpdate, setOpenUpdate] = useState(false);

  useEffect(() => {
    if (openReport) reportForm.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openReport]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {isMyPost ? (
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Are you sure you want to delete
                this post?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletePostMutation.isPending}>
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
                  await context.posts.getUserPosts.invalidate();
                  await context.posts.getPosts.invalidate({
                    type:
                      (searchParams.get("tab") as
                        | "all"
                        | "program"
                        | "college"
                        | undefined) ?? "following",
                  });
                }}
                disabled={deletePostMutation.isPending}
              >
                {deletePostMutation.isPending && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <AlertDialog open={openReport} onOpenChange={setOpenReport}>
          <AlertDialogContent>
            <Form {...reportForm}>
              <form
                onSubmit={reportForm.handleSubmit((values) => {
                  if (values.id === "other" && !values.reason.length) {
                    reportForm.setError("reason", {
                      message: "Please provide a reason for your report.",
                    });
                    return;
                  }
                  reportPostMutation.mutate({
                    post_id,
                    reason: values.id === "other" ? values.reason : values.id,
                  });
                })}
                className="space-y-4"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Report Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Report this post to the administrators.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <FormField
                  control={reportForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {REPORT_POST_REASONS.map((reason) => (
                            <SelectItem key={reason.id} value={reason.id}>
                              {reason.reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormDescription>
                        Please provide a reason for your report.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {reportForm.watch("id") === "other" && (
                  <FormField
                    control={reportForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Please provide a reason for your report."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Please provide a reason for your report.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={reportPostMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>

                  <Button
                    variant="destructive"
                    type="submit"
                    disabled={reportPostMutation.isPending}
                  >
                    {reportPostMutation.isPending && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Report
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      )}
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
          {isMyPost ? (
            <DropdownMenuItem
              className="!text-red-500"
              onClick={() => setOpenDelete(true)}
            >
              Delete
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="!text-red-500"
              onClick={() => setOpenReport(true)}
            >
              Report post
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
