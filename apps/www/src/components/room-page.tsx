"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { EllipsisVertical, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

import type { RouterOutput } from "@kabsu.me/api/root";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { api } from "~/lib/trpc/client";
import { cn } from "~/lib/utils";

export default function RoomPageClient({
  getRoom,
}: {
  getRoom: RouterOutput["chats"]["getRoom"];
}) {
  const getRoomQuery = api.chats.getRoom.useQuery(
    { room_id: getRoom.id },
    { initialData: getRoom },
  );
  const sendMessageMutation = api.chats.sendMessage.useMutation();
  const [messages, setMessages] = useState<
    RouterOutput["chats"]["getRoom"]["chats"]
  >(getRoomQuery.data.chats);

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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView();
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between p-4">
        <div className="flex items-center gap-2">
          <div>
            <Image
              src="/default-avatar.jpg"
              width={32}
              height={32}
              alt="Profile picture"
              className="rounded-full"
            />
          </div>
          <div>
            <p className="text-sm">
              {getRoomQuery.data.rooms_users
                .map((user) => `@${user.users?.username}`)
                .join(", ")}
            </p>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 text-lg" />
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <EllipsisVertical size="1rem" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Test</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      <div className="flex h-0 flex-grow">
        {messages.length === 0 ? (
          <div className="grid flex-1 place-items-center">
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  ref={messages.length - 1 === index ? messagesEndRef : null}
                  className={cn(
                    "flex items-end gap-2",
                    message.is_me && "flex-row-reverse",
                  )}
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

                  <div
                    className={cn(
                      "group flex items-center gap-2",
                      message.is_me && "flex-row-reverse",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-60 rounded-md bg-muted px-3 py-2 xs:max-w-72 sm:max-w-96",
                        message.is_me ? "rounded-br-none" : "rounded-bl-none",
                      )}
                    >
                      <p>{message.content}</p>
                    </div>
                    <p
                      className={cn(
                        "hidden truncate text-xs text-muted-foreground group-hover:block",
                        !message.is_me && "text-right",
                      )}
                    >
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
                    is_me: true,
                    created_at: new Date().toISOString(),
                  },
                ]);
                form.reset();
                await sendMessageMutation.mutateAsync({
                  room_id: getRoomQuery.data.id,
                  content: values.message,
                });
                await getRoomQuery.refetch();
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
