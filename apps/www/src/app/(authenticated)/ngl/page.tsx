"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Reply, Trash2, VenetianMask, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/lib/trpc/client";
import { cn } from "~/lib/utils";

const TabSchema = z.enum(["messages", "replied"]);

export default function NGLPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<z.infer<typeof TabSchema>>(
    TabSchema.safeParse(searchParams.get("tab") ?? "messages").data ??
      "messages",
  );
  const getAllMyMessagesQuery = api.ngl.getAllMyMessages.useQuery({ tab });
  return (
    <div>
      <div className="grid place-items-center gap-2 border-b p-10">
        <div className="rounded-full bg-muted p-4">
          <VenetianMask className="size-10" />
        </div>
        <h2 className="text-xl font-semibold">Your NGL Messages</h2>
      </div>

      <>
        <div className="flex justify-center p-4">
          <Tabs
            value={tab}
            onValueChange={(value) => {
              const data = TabSchema.safeParse(value).data ?? "messages";

              setTab(data);

              const search = new URLSearchParams(searchParams);
              search.set("tab", data);

              router.push(`./ngl?${search.toString()}`);
            }}
          >
            <TabsList>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="replied">Replied</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {getAllMyMessagesQuery.isLoading ||
        getAllMyMessagesQuery.data === undefined ? (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[80px] w-full" />
            ))}
          </div>
        ) : getAllMyMessagesQuery.data.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground sm:col-span-2">
            No messages yet.
          </div>
        ) : (
          <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2 }}>
            <Masonry gutter="16px" className="p-4">
              {getAllMyMessagesQuery.data.map((message) => (
                <Question key={message.id} message={message} />
              ))}
            </Masonry>
          </ResponsiveMasonry>
        )}
      </>
    </div>
  );
}

const FormSchema = z
  .object({
    content: z
      .string()
      .min(1, "Message is required.")
      .max(500, "Message is too long."),
    is_reply_enabled: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.is_reply_enabled && data.content.length === 0) return false;

      return true;
    },
    { message: "Reply is required.", path: ["content"] },
  );

function Question({
  message,
}: {
  message: RouterOutputs["ngl"]["getAllMyMessages"][number];
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const searchParams = useSearchParams();
  const utils = api.useUtils();
  const deleteMessageMutation = api.ngl.deleteMessage.useMutation({
    onSuccess: () => utils.ngl.getAllMyMessages.invalidate(),
  });
  const answerMessageMutation = api.ngl.answerMessage.useMutation({
    onSuccess: async () => {
      await utils.ngl.getAllMyMessages.invalidate();
      form.reset();
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: "",
      is_reply_enabled: false,
    },
  });

  return (
    <div
      id={message.id}
      className={cn(
        "space-y-2 rounded-lg border p-4",
        searchParams.has("question_id", message.id) && "border-primary",
      )}
    >
      <p>{message.content}</p>
      <p className="text-xs text-muted-foreground">
        {message.code_name ? <span>{message.code_name} • </span> : null}
        {formatDistanceToNow(message.created_at)}
      </p>

      {message.answers.length > 0 ? (
        message.answers.map((answer) => (
          <div key={answer.id} className="rounded-lg bg-muted p-4">
            <p>{answer.content}</p>
            <p className="text-xs text-muted-foreground">
              You • {formatDistanceToNow(answer.created_at)}
            </p>
          </div>
        ))
      ) : form.watch("is_reply_enabled") ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              answerMessageMutation.mutate({
                content: values.content,
                question_id: message.id,
              }),
            )}
            className="flex flex-col gap-2"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Reply..."
                      className="w-full"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="sm"
              disabled={answerMessageMutation.isPending}
            >
              {answerMessageMutation.isPending ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Reply className="mr-1.5 size-4" />
              )}
              Reply
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => form.setValue("is_reply_enabled", false)}
            >
              <XCircle className="mr-1.5 size-4" />
              Cancel
            </Button>
          </form>
        </Form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => form.setValue("is_reply_enabled", true)}
        >
          <Reply className="mr-1.5 size-4" />
          Reply
        </Button>
      )}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs !text-destructive"
          >
            <Trash2 className="mr-1.5 size-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this message?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteMessageMutation.isPending}
              onClick={async () => {
                await deleteMessageMutation.mutateAsync({
                  question_id: message.id,
                });
                setDeleteOpen(false);
              }}
            >
              {deleteMessageMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
