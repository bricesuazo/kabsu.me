"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { REPORT_POST_REASONS } from "@kabsu.me/constants";
import { MoreVertical } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icons } from "../../../../components/icons";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { toast } from "../../../../components/ui/use-toast";

export default function CommentDropdown({
  comment_id,
  isMyComment,
}: {
  comment_id: string;
  isMyComment: boolean;
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
      toast({
        title: "Comment reported",
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
        id: z.string().nonempty("Please select a reason for your report."),
        reason: z.string(),
      }),
    ),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    if (openReport) reportForm.reset();
  }, [openReport]);

  return (
    <>
      {isMyComment ? (
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
                  await deleteCommentMutation.mutateAsync({ comment_id });
                  setLoading(false);
                  setOpenDelete(false);
                  toast({
                    title: "Comment deleted",
                    description: "Your comment has been deleted.",
                  });

                  await context.posts.getPost.invalidate({
                    post_id: params.post_id as string,
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
          <DropdownMenuLabel>Comment</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isMyComment ? (
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
              Report comment
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
