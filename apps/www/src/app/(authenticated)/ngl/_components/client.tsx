"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Reply,
  Trash,
  Trash2,
  VenetianMask,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";
import { cn } from "@kabsu.me/ui";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@kabsu.me/ui/alert-dialog";
import { Button } from "@kabsu.me/ui/button";
import { Checkbox } from "@kabsu.me/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@kabsu.me/ui/form";
import { Input } from "@kabsu.me/ui/input";
import { Skeleton } from "@kabsu.me/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@kabsu.me/ui/tabs";
import { Textarea } from "@kabsu.me/ui/textarea";

import { env } from "~/env";
import { api } from "~/lib/trpc/client";

const TabSchema = z.enum(["messages", "replied"]);

export default function NGLPageClient({ username }: { username: string }) {
  const [toDelete, setToDelete] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const utils = api.useUtils();

  const [isCopied, setIsCopied] = useState(false);
  const [tab, setTab] = useState<z.infer<typeof TabSchema>>(
    TabSchema.safeParse(searchParams.get("tab") ?? "messages").data ??
      "messages",
  );

  const getAllMyMessagesQuery = api.ngl.getAllMyMessages.useQuery({ tab });
  const deleteMessageMutation = api.ngl.deleteMessages.useMutation({
    onSuccess: () => utils.ngl.getAllMyMessages.invalidate(),
  });

  const MY_NGL_URL = env.NEXT_PUBLIC_NGL_URL + "/" + username;
  return (
    <div>
      <div className="grid place-items-center gap-2 border-b p-10">
        <div className="rounded-full bg-muted p-4">
          <VenetianMask className="size-10" />
        </div>
        <h2 className="text-center text-xl font-semibold">Your NGL Messages</h2>

        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={MY_NGL_URL.replace(/(^\w+:|^)\/\//, "")}
            className="w-full max-w-80 text-sm"
          />
          <div>
            <Button
              size="icon"
              variant="ghost"
              disabled={isCopied}
              onClick={async () => {
                await navigator.clipboard.writeText(MY_NGL_URL);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
            >
              {isCopied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          <div>
            <Button size="icon" variant="ghost" asChild>
              <Link href={MY_NGL_URL} target="_blank">
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <>
        <div className="flex flex-col items-center justify-center gap-3 p-4">
          <Tabs
            value={tab}
            onValueChange={(value) => {
              setToDelete([]);
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

        <div className="pb-20">
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
                  <Question
                    key={message.id}
                    message={message}
                    setToDelete={setToDelete}
                    toDelete={toDelete}
                  />
                ))}
              </Masonry>
            </ResponsiveMasonry>
          )}
        </div>

        <div className="container fixed bottom-0 -ml-[1px] flex h-16 items-center justify-end border-l border-r border-t bg-white p-4 dark:bg-[#121212]">
          {/* <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={
                getAllMyMessagesQuery.data?.length !== 0
                  ? getAllMyMessagesQuery.data?.length === toDelete.length
                  : false
              }
              onCheckedChange={(val) => {
                if (val) {
                  setToDelete(
                    getAllMyMessagesQuery.data?.map((message) => message.id) ??
                      [],
                  );
                } else {
                  setToDelete([]);
                }
              }}
            />
            <Label htmlFor="select-all">Select All</Label>
          </div> */}

          {toDelete.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={"destructive"} className="gap-1">
                  {deleteMessageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 size-4 animate-spin" />{" "}
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash size={15} />
                      Delete &#40;{toDelete.length}&#41;
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {toDelete.length > 0
                      ? "Are you sure you want to delete these messages?"
                      : "Are you sure you want to delete this message?"}
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
                        question_id: toDelete,
                      });

                      setToDelete([]);
                    }}
                  >
                    {deleteMessageMutation.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 size-4 animate-spin" />{" "}
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
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
  setToDelete,
  toDelete,
}: {
  message: RouterOutputs["ngl"]["getAllMyMessages"][number];
  setToDelete: Dispatch<SetStateAction<string[]>>;
  toDelete: string[];
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const searchParams = useSearchParams();
  const utils = api.useUtils();
  const deleteMessageMutation = api.ngl.deleteMessages.useMutation({
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
        "shadow-effect dark:shadow-light space-y-2 rounded-lg border border-black p-4 dark:border-white/20",
        searchParams.has("question_id", message.id) && "border-primary",
      )}
    >
      <div className="flex justify-between">
        <p className="break-words">{message.content}</p>
        <Checkbox
          onCheckedChange={(val) => {
            if (val) {
              setToDelete((curr) => [...curr, message.id]);
            } else {
              setToDelete((curr) => curr.filter((id) => id !== message.id));
            }
          }}
          checked={toDelete.includes(message.id)}
        />
      </div>
      <p className="break-words text-xs text-muted-foreground">
        {message.code_name ? <span>{message.code_name} • </span> : null}
        {formatDistanceToNow(message.created_at, {
          includeSeconds: true,
          addSuffix: true,
        })}
      </p>

      {message.answers.length > 0 ? (
        message.answers.map((answer) => (
          <div key={answer.id} className="rounded-lg border p-4">
            <p className="break-words">{answer.content}</p>
            <p className="break-words text-xs text-muted-foreground">
              You •{" "}
              {formatDistanceToNow(answer.created_at, {
                includeSeconds: true,
                addSuffix: true,
              })}
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
                  question_id: [message.id],
                });
                setDeleteOpen(false);
                setToDelete((curr) => curr.filter((id) => id !== message.id));
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
