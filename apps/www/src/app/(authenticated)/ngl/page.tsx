"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Reply, VenetianMask, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";

import ClientOnly from "~/components/client-only";
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

        {getAllMyMessagesQuery.isLoading ||
        getAllMyMessagesQuery.data === undefined ? (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[80px] w-full" />
            ))}
          </div>
        ) : getAllMyMessagesQuery.data.length === 0 ? (
          <div className="text-center text-muted-foreground sm:col-span-2">
            No messages yet.
          </div>
        ) : (
          <ClientOnly>
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2 }}>
              <Masonry gutter="16px" className="p-4">
                {getAllMyMessagesQuery.data.map((message) => (
                  <Question key={message.id} message={message} />
                ))}
              </Masonry>
            </ResponsiveMasonry>
          </ClientOnly>
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
  const answerMessageQuery = api.ngl.answerMessage.useMutation({
    onSuccess: () => {
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
    <p>
      <div className="space-y-2 rounded-lg border p-4">
        <p>{message.content}</p>
        <p className="text-xs text-muted-foreground">
          {message.code_name ? <span>{message.code_name} • </span> : null}
          {formatDistanceToNow(message.created_at)}
        </p>

        {form.watch("is_reply_enabled") ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                answerMessageQuery.mutate({
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
                disabled={answerMessageQuery.isPending}
              >
                {answerMessageQuery.isPending ? (
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
      </div>
    </p>
  );
}
