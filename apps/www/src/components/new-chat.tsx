"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";
import { Button } from "@kabsu.me/ui/button";
import { Form, FormControl, FormField, FormItem } from "@kabsu.me/ui/form";
import { ScrollArea } from "@kabsu.me/ui/scroll-area";
import { Separator } from "@kabsu.me/ui/separator";

import { api } from "~/lib/trpc/client";
import { Icons } from "./icons";

export default function NewChat({
  user,
}: {
  user: NonNullable<RouterOutputs["chats"]["getOrCreateRoom"]["user"]>;
}) {
  const router = useRouter();
  const sendNewMessageMutation = api.chats.sendNewMessage.useMutation({
    onError: (error) => {
      if (error.message.startsWith("room_"))
        router.push(error.message.slice(5));
      if (error.message === "user_not_found") router.push("/chat");
    },
    onSuccess: ({ room_id }) => router.push(`/chat/${room_id}`),
  });
  const form = useForm<{ message: string }>({
    resolver: zodResolver(
      z.object({
        message: z.string().min(1, {
          message: "Message cannot be empty.",
        }),
      }),
    ),
    defaultValues: {
      message: "",
    },
  });
  const [messages, setMessages] = useState<
    {
      id: string;
      content: string;
      created_at: string;
    }[]
  >([]);
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between p-4">
        <div className="flex items-center gap-2">
          <div>
            <Image
              src={user.image_name ? user.image_url : "/default-avatar.jpg"}
              width={44}
              height={44}
              alt="Profile picture"
              className="rounded-full"
            />
          </div>
          <div>
            <p className="text-xl font-semibold">{user.name}</p>
            <p className="text-sm">@{user.username}</p>

            {/* <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 text-lg" />
              <p className="text-xs text-muted-foreground">Online</p>
            </div> */}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex h-0 flex-grow">
        {messages.length === 0 ? (
          <div className="flex w-full flex-col items-center pt-4 text-center text-muted-foreground">
            <Image
              src={user.image_name ? user.image_url : "/default-avatar.jpg"}
              width={96}
              height={96}
              alt="Profile picture"
              className="rounded-full"
            />
            <h4 className="text-xl font-semibold text-foreground">
              {user.name}
            </h4>
            <p className="text-sm">@{user.username}</p>
            <p className="text-sm">{user.type}</p>
            <Link href={`/${user.username}`}>
              <Button>View Profile</Button>
            </Link>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex flex-row-reverse items-end gap-2"
                >
                  <div>
                    <Image
                      src="/default-avatar.jpg"
                      width={28}
                      height={28}
                      alt="Profile picture"
                      className="rounded-full"
                    />
                  </div>

                  <div className="group flex flex-row-reverse items-center gap-2">
                    <div className="max-w-60 rounded-md rounded-br-none bg-muted px-3 py-2 xs:max-w-72 sm:max-w-96">
                      <p>{message.content}</p>
                    </div>
                    <p className="hidden truncate text-right text-xs text-muted-foreground group-hover:block">
                      {formatDistanceToNow(message.created_at, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: String(prev.length + 1),
                    content: values.message,
                    created_at: new Date().toISOString(),
                  },
                ]);
                form.reset();
                await sendNewMessageMutation.mutateAsync({
                  user_id: user.id,
                  content: values.message,
                });
              })}
              className="flex w-full gap-x-2"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex flex-1 items-center gap-2 space-y-0">
                    <FormControl>
                      <TextareaAutosize
                        {...field}
                        placeholder="Write a message..."
                        autoFocus
                        disabled={form.formState.isSubmitting}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) {
                            e.preventDefault();
                          }
                        }}
                        rows={1}
                        maxRows={3}
                        className="flex w-full flex-1 resize-none rounded-md border border-input bg-background px-3 py-1.5 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      size="icon"
                      variant="outline"
                      disabled={
                        form.formState.isSubmitting || !form.formState.isValid
                      }
                    >
                      {form.formState.isSubmitting ? (
                        <Icons.spinner className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
