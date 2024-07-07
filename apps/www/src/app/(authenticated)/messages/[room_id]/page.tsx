"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { EllipsisVertical, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

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
import { cn } from "~/lib/utils";

export default function RoomPage({ params }: { params: { room_id: string } }) {
  console.log("🚀 ~ RoomPage ~ params:", params);

  const [messages, setMessages] = useState<
    {
      id: string;
      message: string;
      is_me: boolean;
    }[]
  >([
    {
      id: "1",
      message: "Hello, how are you?",
      is_me: false,
    },
    {
      id: "2",
      message: "I'm good, how about you?",
      is_me: true,
    },
    {
      id: "3",
      message: "I'm good too.",
      is_me: false,
    },
    {
      id: "4",
      message: "That's great!",
      is_me: true,
    },
    {
      id: "5",
      message: "Yeah!",
      is_me: false,
    },
    {
      id: "6",
      message: "Hello, how are you?",
      is_me: false,
    },
    {
      id: "7",
      message: "I'm good, how about you?",
      is_me: true,
    },
    {
      id: "8",
      message: "I'm good too.",
      is_me: false,
    },
    {
      id: "9",
      message: "That's great!",
      is_me: true,
    },
    {
      id: "10",
      message: "Yeah!",
      is_me: false,
    },
    {
      id: "11",
      message: "Hello, how are you?",
      is_me: false,
    },
    {
      id: "12",
      message: "I'm good, how about you?",
      is_me: true,
    },
    {
      id: "13",
      message: "I'm good too.",
      is_me: false,
    },
    {
      id: "14",
      message: "That's great!",
      is_me: true,
    },
    {
      id: "15",
      message: "Yeah!",
      is_me: false,
    },
  ]);

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

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
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
            <p className="text-sm">Brice Suazo</p>
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
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="grid h-full place-items-center">
                <p className="text-muted-foreground">No messages yet.</p>
              </div>
            ) : (
              messages.map((message, index) => (
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
                      "max-w-60 rounded-md bg-muted px-3 py-2 xs:max-w-72 sm:max-w-96",
                      message.is_me ? "rounded-br-none" : "rounded-bl-none",
                    )}
                  >
                    <p>{message.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: String(prev.length + 1),
                    message: values.message,
                    is_me: true,
                  },
                ]);

                form.reset();

                setTimeout(() => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: String(prev.length + 1),
                      message: "Hello, how are you?",
                      is_me: false,
                    },
                  ]);
                }, 1000);
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
                      {form.formState.isSubmitting && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Send />
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
