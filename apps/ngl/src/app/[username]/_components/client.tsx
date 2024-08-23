"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Loader2, Send, VenetianMask } from "lucide-react";
import { useForm } from "react-hook-form";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { toast } from "sonner";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";
import { Alert, AlertDescription, AlertTitle } from "@kabsu.me/ui/alert";
import { Button } from "@kabsu.me/ui/button";
import { Checkbox } from "@kabsu.me/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kabsu.me/ui/form";
import { Input } from "@kabsu.me/ui/input";
import { Skeleton } from "@kabsu.me/ui/skeleton";
import { Textarea } from "@kabsu.me/ui/textarea";

import ClientOnly from "~/components/client-only";
import { api } from "~/lib/trpc/client";
import { createClient } from "~/supabase/client";

const FormSchema = z
  .object({
    content: z
      .string()
      .min(1, "Message is required.")
      .max(256, "Message is too long."),
    is_codename_enabled: z.boolean().default(false),
    code_name: z
      .string()
      .min(1, "Code name is required.")
      .max(64, "Code name is too long.")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.is_codename_enabled && !data.code_name) return false;

      return true;
    },
    { message: "Code name is required.", path: ["code_name"] },
  );

export default function UserPageClient({
  user,
}: {
  user: NonNullable<RouterOutputs["ngl"]["getUser"]>;
}) {
  const getUserQuery = api.ngl.getUser.useQuery(
    { username: user.username },
    { initialData: user },
  );
  const getAllMessagesQuery = api.ngl.getAllMessages.useQuery({
    user_id: user.id,
  });
  const sendMessageMutation = api.ngl.sendMessage.useMutation({
    onError: (error) =>
      form.setError("root", {
        type: "manual",
        message: error.message,
      }),
    onSuccess: () => {
      toast.success("Message sent!", { position: "bottom-center" });
      form.resetField("content");
    },
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: "",
      is_codename_enabled: false,
    },
  });

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel(`ngl.${user.username}`);
    channel
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .on("broadcast", { event: "reply" }, async () => {
        await getAllMessagesQuery.refetch();
      })
      .subscribe();

    return () => {
      void channel.unsubscribe();
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.username]);

  if (!getUserQuery.data) return null;

  return (
    <div>
      <header className="border-b">
        <div className="container grid place-items-center py-4">
          <Link href="/" className="flex flex-col items-center">
            <VenetianMask className="size-5" />
            <p className="font-bold leading-none">NGL</p>
            <p className="text-xs leading-none text-muted-foreground">
              Kabsu.me
            </p>
          </Link>
        </div>
      </header>
      <div className="border-b py-5">
        <div className="container flex flex-col items-center">
          <Image
            src={
              getUserQuery.data.image_name
                ? getUserQuery.data.image_url
                : "/default-avatar.jpg"
            }
            alt="Avatar"
            width={100}
            height={100}
            className="mb-2 rounded-full"
          />
          <h4 className="text-xl font-semibold">{getUserQuery.data.name}</h4>
          <p className="text-muted-foreground">@{getUserQuery.data.username}</p>
        </div>
      </div>
      <div className="container space-y-5 py-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              sendMessageMutation.mutate({
                content: values.content,
                code_name: values.code_name,
                user_id: user.id,
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
                      placeholder={`Message @${getUserQuery.data?.username} anonymously...`}
                      className="w-full"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("is_codename_enabled") && (
              <FormField
                control={form.control}
                name="code_name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Code name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-center justify-between gap-5">
              <FormField
                control={form.control}
                name="is_codename_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Add code name</FormLabel>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={sendMessageMutation.isPending}>
                {sendMessageMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 size-4" />
                    Send
                  </>
                )}
              </Button>
            </div>

            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
        <div>
          {getAllMessagesQuery.isLoading ||
          getAllMessagesQuery.data === undefined ? (
            <div className="columns-1 gap-3 space-y-3 pb-10 sm:columns-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[80px] w-full" />
              ))}
            </div>
          ) : getAllMessagesQuery.data.length === 0 ? (
            <div className="text-center text-muted-foreground sm:col-span-2">
              No messages yet.
            </div>
          ) : (
            <ClientOnly>
              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2 }}>
                <Masonry gutter="16px">
                  {getAllMessagesQuery.data.map((message) => (
                    <div
                      key={message.id}
                      className="space-y-2 rounded-lg border p-4"
                    >
                      <p>{message.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.code_name ? (
                          <span>{message.code_name} • </span>
                        ) : null}
                        {formatDistanceToNow(message.created_at, {
                          includeSeconds: true,
                          addSuffix: true,
                        })}
                      </p>

                      {message.answers.map((answer) => (
                        <div
                          key={answer.id}
                          className="rounded-lg bg-muted p-4"
                        >
                          <p>{answer.content}</p>
                          <p className="text-xs text-muted-foreground">
                            You •{" "}
                            {formatDistanceToNow(answer.created_at, {
                              includeSeconds: true,
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            </ClientOnly>
          )}
        </div>
      </div>
    </div>
  );
}
