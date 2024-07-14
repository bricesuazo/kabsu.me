"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  EllipsisVertical,
  ExternalLink,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

import type { RouterOutput } from "@kabsu.me/api/root";

import type { Database } from "../../../../supabase/types";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { api } from "~/lib/trpc/client";
import { cn } from "~/lib/utils";
import { createClient } from "~/supabase/client";

export default function RoomPageClient(
  props: (
    | {
        type: Database["public"]["Enums"]["global_chat_type"];
        getMyUniversityStatus: RouterOutput["auth"]["getMyUniversityStatus"];
      }
    | {
        type: "room";
      }
  ) & {
    current_user: RouterOutput["auth"]["getCurrentUser"];
    getRoomChats: NonNullable<RouterOutput["chats"]["getRoomChats"]>;
  },
) {
  const supabase = createClient();

  const getRoomChatsQuery = api.chats.getRoomChats.useQuery(
    {
      ...(props.type === "room"
        ? { type: props.type, room_id: props.getRoomChats.room.id }
        : { type: props.type }),
    },
    { initialData: props.getRoomChats },
  );
  const sendMessageMutation = api.chats.sendMessage.useMutation();
  const [chats, setChats] = useState(getRoomChatsQuery.data?.room.chats ?? []);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasMore) {
        loadMoreMessagesMutation.mutate({
          len: chats.length,
          ...(props.type === "room"
            ? { type: props.type, room_id: props.getRoomChats.room.id }
            : { type: props.type }),
        });
      }
    },
  });
  const loadMoreMessagesMutation = api.chats.loadMoreMessages.useMutation({
    onSuccess: (data) => {
      const new_data = data?.room.chats ?? [];
      setHasMore(new_data.length !== 0);
      if (new_data.length > 0) scrollRef.current?.scrollIntoView();

      setChats((prev) => [...new_data, ...prev]);
    },
  });

  const form = useForm<{ message: string }>({
    resolver: zodResolver(
      z.object({
        message: z
          .string()
          .min(1, {
            message: "Message cannot be empty.",
          })
          .max(512, {
            message: "Message cannot be longer than 512 characters.",
          }),
      }),
    ),
    defaultValues: {
      message: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(false);

    const channel = supabase.channel(
      `chat_${props.type}_${props.type === "room" ? props.getRoomChats.room.id : props.type === "all" ? "all" : props.type === "campus" ? props.getMyUniversityStatus?.programs?.colleges?.campuses?.id : props.type === "college" ? props.getMyUniversityStatus?.programs?.colleges?.id : props.getMyUniversityStatus?.programs?.id}`,
    );

    channel
      .on("broadcast", { event: "new" }, ({ payload }) => {
        setChats((prev) => [...prev, payload as (typeof chats)[number]]);
        messagesEndRef.current?.scrollIntoView(false);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
      void channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between p-4">
        <div className="flex items-center gap-2">
          <Button
            className="size-8 rounded-full"
            size="icon"
            variant="ghost"
            asChild
          >
            <Link href="/chat">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          {props.type === "room" ? (
            <>
              <Link href={`/${props.getRoomChats.room.to?.username}`}>
                <Image
                  src={
                    props.getRoomChats.room.to?.image_name
                      ? props.getRoomChats.room.to.image_url
                      : "/default-avatar.jpg"
                  }
                  width={32}
                  height={32}
                  alt="Profile picture"
                  className="rounded-full"
                />
              </Link>
              <div>
                <Link
                  href={`/${props.getRoomChats.room.to?.username}`}
                  className="group flex items-center text-sm"
                >
                  <span>{props.getRoomChats.room.to?.username}</span>
                  <ExternalLink className="ml-2 size-4 -translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-500 text-lg" />
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-lg">
              {props.type === "all"
                ? "All campuses"
                : props.type.charAt(0).toUpperCase() +
                  props.type.slice(1) +
                  `${
                    props.getMyUniversityStatus
                      ? `(${
                          props.type === "campus"
                            ? props.getMyUniversityStatus.programs?.colleges?.campuses?.slug.toUpperCase()
                            : props.type === "college"
                              ? props.getMyUniversityStatus.programs?.colleges?.slug.toUpperCase()
                              : props.getMyUniversityStatus.programs?.slug.toUpperCase()
                        })`
                      : ""
                  }`}
            </p>
          )}
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
        {chats.length === 0 ? (
          <div className="grid flex-1 place-items-center">
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              <div ref={ref}>
                <p className="text-center text-sm text-muted-foreground">
                  {loadMoreMessagesMutation.isPending && hasMore
                    ? "Loading more messages..."
                    : "No more messages."}
                </p>
              </div>
              <div ref={scrollRef} />
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-end gap-2",
                    chat.user_id === props.current_user.id &&
                      "flex-row-reverse",
                  )}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Image
                        src={
                          props.current_user.id === chat.user_id
                            ? props.current_user.image_name
                              ? props.current_user.image_url
                              : "/default-avatar.jpg"
                            : chat.user.image_name
                              ? chat.user.image_url
                              : "/default-avatar.jpg"
                        }
                        width={32}
                        height={32}
                        alt="Profile picture"
                        className="rounded-full"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link href={`/${chat.user.username}`}>
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div
                    className={cn(
                      "flex flex-1 flex-col gap-y-1",
                      chat.user_id === props.current_user.id
                        ? "items-end"
                        : "items-start",
                    )}
                  >
                    <Link
                      href={`/${chat.user.username}`}
                      className="max-w-52 truncate text-sm text-muted-foreground xs:max-w-60"
                    >
                      {chat.user.name} — {chat.user.username}
                    </Link>

                    <div
                      className={cn(
                        "group flex items-center gap-2",
                        chat.user_id === props.current_user.id &&
                          "flex-row-reverse",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-60 rounded-md bg-muted px-3 py-2 xs:max-w-72 sm:max-w-96",
                          chat.user_id === props.current_user.id
                            ? "rounded-br-none"
                            : "rounded-bl-none",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {chat.content}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "hidden text-xs text-muted-foreground group-hover:block",
                          chat.user_id === props.current_user.id &&
                            "text-right",
                        )}
                      >
                        {formatDistanceToNow(chat.created_at, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                setChats((prev) => [
                  ...prev,
                  {
                    id: new Date().toISOString(),
                    content: values.message,
                    created_at: new Date().toISOString(),
                    user_id: props.current_user.id,
                    user: {
                      id: props.current_user.id,
                      name: props.current_user.name,
                      username: props.current_user.username,
                      ...(props.current_user.image_name
                        ? {
                            image_name: props.current_user.image_name,
                            image_url: props.current_user.image_url,
                          }
                        : { image_name: null }),
                    },
                  },
                ]);
                messagesEndRef.current?.scrollIntoView(false);
                form.reset();

                await sendMessageMutation.mutateAsync(
                  props.type === "room"
                    ? {
                        type: props.type,
                        room_id: props.getRoomChats.room.id,
                        content: values.message,
                      }
                    : {
                        type: props.type,
                        content: values.message,
                      },
                );

                // await getRoomChatsQuery.refetch();
              })}
              className="w-full gap-x-2"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormMessage />
                    <div className="flex flex-1 items-center gap-2 space-y-0">
                      <FormControl>
                        <TextareaAutosize
                          {...field}
                          placeholder="Write a message..."
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
                    </div>
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
