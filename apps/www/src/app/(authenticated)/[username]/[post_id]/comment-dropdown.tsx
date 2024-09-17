"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoreVertical } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { REPORT_POST_REASONS } from "@kabsu.me/constants";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kabsu.me/ui/alert-dialog";
import { Button } from "@kabsu.me/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@kabsu.me/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kabsu.me/ui/form";
import { Input } from "@kabsu.me/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kabsu.me/ui/select";

import { Icons } from "~/components/icons";
import { api } from "~/lib/trpc/client";

export default function CommentDropdown({
  comment_id,
  isMyComment,
  level,
}: {
  comment_id: string;
  isMyComment: boolean;
  level: number;
}) {
  const params = useParams();
  const context = api.useUtils();
  const deleteCommentMutation = api.comments.delete.useMutation();
  const [openDelete, setOpenDelete] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [loading, setLoading] = useState(false);

  const reportCommentMutation = api.comments.report.useMutation({
    onSuccess: () => {
      setOpenReport(false);
      toast.success("Comment reported", {
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

  useEffect(() => {
    if (openReport) reportForm.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openReport]);

  return (
    <>
      {isMyComment ? (
        <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {level === 0 ? "Delete Comment" : "Delete Reply"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {/* This action cannot be undone. This will permanently delete your
                account and remove your data from our servers. */}
                {`This action cannot be undone. This will permanently delete your ${level === 0 ? "comment" : "reply"} and remove it's data from our servers.`}
                {/* This acction cannot be undone. This will permanently delete your
                {level === 0 ? "comment" : "reply"} and remove it's data from our servers. */}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={async () => {
                  setLoading(true);
                  await deleteCommentMutation.mutateAsync({ comment_id });
                  setLoading(false);
                  setOpenDelete(false);
                  toast("Comment deleted", {
                    description: "Your comment has been deleted.",
                  });

                  await context.posts.getPost.invalidate({
                    post_id: params.post_id as string,
                  });

                  // context.comments.getFullComment.setData(
                  //   { comment_id },
                  //   (updater) => {
                  //     if (!updater) return;

                  //     return {
                  //       ...updater,
                  //       comment: {
                  //         ...updater.comment,
                  //         replies: updater.comment.replies.filter(
                  //           (reply) => reply.thread_id !== comment_id,
                  //         ),
                  //       },
                  //     };
                  //   },
                  // );
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
                  reportCommentMutation.mutate({
                    comment_id,
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
                  <AlertDialogCancel disabled={reportCommentMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>

                  <Button
                    variant="destructive"
                    type="submit"
                    disabled={reportCommentMutation.isPending}
                  >
                    {reportCommentMutation.isPending && (
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
          <DropdownMenuLabel>
            {/* {level === 0 ? "Comment" : "Reply"} */}
            Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isMyComment ? (
            <DropdownMenuItem
              className="!text-red-500 cursor-pointer"
              onClick={() => setOpenDelete(true)}
            >
              {level === 0 ? "Delete Comment" : "Delete Reply"}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="!text-red-500 cursor-pointer"
              onClick={() => setOpenReport(true)}
            >
              {/* Not too sure if you can report replies so this might need to be adjusted */}
              {level === 0 ? "Report Comment" : "Report Reply"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
