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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
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
  >([]);

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

  // TODO: fix this
  return (
    <div className={cn("flex flex-col", `h-[calc(100vh-72px)]`)}>
      <div className="flex justify-between p-4">
        <div className="flex gap-2">
          <div>
            <Image
              src="/default-avatar.jpg"
              width={28}
              height={28}
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
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
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
                  width={32}
                  height={32}
                  alt="Profile picture"
                  className="rounded-full"
                />
              </div>
              <div className="max-w-60 rounded-md bg-muted p-2 xs:max-w-72 sm:max-w-96">
                <p>{message.message}</p>
              </div>
            </div>
          ))
        )}
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
