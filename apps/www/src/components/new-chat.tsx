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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@kabsu.me/ui/form";
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

      <div className="flex h-0 flex-1">
        {messages.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center p-8 text-center">
            <div className="max-w-md space-y-2">
              <Image
                src={user.image_name ? user.image_url : "/default-avatar.jpg"}
                width={120}
                height={120}
                alt="Profile picture"
                className="mx-auto rounded-full border-4 border-primary/10"
              />
              <div>
                <h4 className="text-2xl font-bold text-foreground">
                  {user.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  @{user.username} •{" "}
                  <span className="capitalize">{user.type}</span>
                </p>
              </div>
              <p className="text-muted-foreground">
                Start a new conversation with {user.name}. Your messages will
                appear here.
              </p>
              <div className="flex justify-center space-x-2">
                <Link href={`/${user.username}`}>
                  <Button className="bg-primary">View Profile</Button>
                </Link>
              </div>
            </div>
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
              className="w-full gap-x-2"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormMessage />
                    <FormControl>
                      <div className="relative flex items-center">
                        <TextareaAutosize
                          {...field}
                          placeholder="Write a message..."
                          disabled={form.formState.isSubmitting}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              await form.handleSubmit(async (values) => {
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
                              })();
                            }
                          }}
                          rows={1}
                          maxRows={3}
                          className="w-full resize-none rounded-full border-input bg-background px-4 py-2 text-base text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <Button
                          type="submit"
                          size="lg"
                          variant="outline"
                          className="hover:bg-primary-dark ml-3 rounded-full bg-primary p-3 text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          disabled={
                            form.formState.isSubmitting ||
                            !form.formState.isValid ||
                            form.watch("message").trim().length === 0
                          }
                        >
                          {form.formState.isSubmitting ? (
                            <Icons.spinner className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
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
