"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@kabsu.me/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kabsu.me/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kabsu.me/ui/form";
import { Label } from "@kabsu.me/ui/label";
import { ScrollArea } from "@kabsu.me/ui/scroll-area";
import { Skeleton } from "@kabsu.me/ui/skeleton";
import { Textarea } from "@kabsu.me/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kabsu.me/ui/tooltip";

import { api } from "~/lib/trpc/client";

const formSchema = z.object({
  content: z.string().min(2, {
    message: "Please provide a detailed description",
  }),
});

export default function FeedbackForm({
  type,
  open,
  setOpen,
}: {
  type: "bug" | "feature";
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const getAllMyReportedProblemsQuery =
    api.users.getAllMyReportedProblems.useQuery(undefined, {
      enabled: open && type === "bug",
    });
  const getAllMySuggestedFeaturesQuery =
    api.users.getAllMySuggestedFeatures.useQuery(undefined, {
      enabled: open && type === "feature",
    });

  const reportAProblemMutation = api.users.reportAProblem.useMutation({
    onSuccess: async () => {
      await getAllMyReportedProblemsQuery.refetch();
      setOpen(false);
      toast.success("Reported a problem successfully!", {
        description: "Thanks for reporting a problem! We'll look into it",
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const suggestAFeatureMutation = api.users.suggestAFeature.useMutation({
    onSuccess: async () => {
      await getAllMySuggestedFeaturesQuery.refetch();
      setOpen(false);
      toast.success("Suggested a feature successfully!", {
        description: "Thanks for suggesting a feature! We'll look into it",
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (open) form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "bug" ? "Report a bug" : "Request a feature"}
          </DialogTitle>
          <DialogDescription>
            {type === "bug"
              ? "Found a bug? Let us know so we can fix it!"
              : "Have an idea for a feature? Let us know so we can build it!"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              if (type === "bug") {
                reportAProblemMutation.mutate(values);
              } else {
                suggestAFeatureMutation.mutate(values);
              }
            })}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{type === "bug" ? "Bug" : "Feature"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        type === "bug"
                          ? "What went wrong?"
                          : "What do you want to see?"
                      }
                      disabled={
                        reportAProblemMutation.isPending ||
                        suggestAFeatureMutation.isPending
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please be as detailed as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  reportAProblemMutation.isPending ||
                  suggestAFeatureMutation.isPending
                }
              >
                {(reportAProblemMutation.isPending ||
                  suggestAFeatureMutation.isPending) && (
                  <Loader2 className="mr-2 animate-spin" />
                )}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <div>
          <Label>History</Label>
          <ScrollArea viewportClassName="max-h-60">
            {type === "bug" ? (
              getAllMyReportedProblemsQuery.data === undefined ? (
                <>
                  <Skeleton className="h-[72px]" />
                  <Skeleton className="h-[72px]" />
                  <Skeleton className="h-[72px]" />
                </>
              ) : getAllMyReportedProblemsQuery.data.length === 0 ? (
                <div className="p-4">
                  <p className="text-center text-sm text-muted-foreground">
                    No reported problems yet
                  </p>
                </div>
              ) : (
                getAllMyReportedProblemsQuery.data.map((problem) => (
                  <HistoryItem
                    key={problem.id}
                    item={{
                      content: problem.problem,
                      created_at: problem.created_at,
                    }}
                  />
                ))
              )
            ) : getAllMySuggestedFeaturesQuery.data === undefined ? (
              <>
                <Skeleton className="h-[72px]" />
                <Skeleton className="h-[72px]" />
                <Skeleton className="h-[72px]" />
              </>
            ) : getAllMySuggestedFeaturesQuery.data.length === 0 ? (
              <div className="p-4">
                <p className="text-center text-sm text-muted-foreground">
                  No suggested features yet
                </p>
              </div>
            ) : (
              getAllMySuggestedFeaturesQuery.data.map((feature) => (
                <HistoryItem
                  key={feature.id}
                  item={{
                    content: feature.feature,
                    created_at: feature.created_at,
                  }}
                />
              ))
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HistoryItem({
  item,
}: {
  item: { content: string; created_at: string };
}) {
  return (
    <div className="max-w-[375px] space-y-1 text-wrap break-words rounded-md p-4 hover:bg-muted">
      <p className="text-sm">{item.content}</p>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild className="w-fit">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), {
              includeSeconds: true,
              addSuffix: true,
            })}
          </p>
        </TooltipTrigger>
        <TooltipContent>
          {format(new Date(item.created_at), "PPpp")}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
