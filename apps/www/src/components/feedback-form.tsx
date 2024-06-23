"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/lib/trpc/client";
import { Icons } from "./icons";
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
import { toast } from "./ui/use-toast";

const formSchema = z.object({
  content: z.string().min(2, {
    message: "Username must be at least 2 characters.",
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
  const reportAProblemMutation = api.users.reportAProblem.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast({
        title: "Reported a problem",
        description: "Thanks for reporting a problem! We'll look into it",
      });
    },
  });
  const suggestAFeatureMutation = api.users.suggestAFeature.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast({
        title: "Suggested a feature",
        description: "Thanks for suggesting a feature! We'll look into it",
      });
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
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
                reportAProblemMutation.mutate({ content: values.content });
              } else {
                suggestAFeatureMutation.mutate({ content: values.content });
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
                  <Icons.spinner className="mr-2 animate-spin" />
                )}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
