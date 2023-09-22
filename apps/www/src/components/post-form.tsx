"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/lib/trpc/client";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

import { POST_TYPE_TABS } from "@cvsu.me/constants";
import { POST_TYPE } from "@cvsu.me/db/schema";

import { Icons } from "./icons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";

const Schema = z.object({
  content: z
    .string()
    .trim()
    .nonempty({ message: "Post cannot be empty." })
    .max(512, {
      message: "Post cannot be longer than 512 characters.",
    }),
  type: z.enum(POST_TYPE).default(POST_TYPE[0]),
});
export default function PostForm({ hasRedirect }: { hasRedirect?: boolean }) {
  const context = api.useContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      type: searchParams.has("tab")
        ? (searchParams.get("tab") as (typeof POST_TYPE)[number])
        : "following",
      content: "",
    },
  });

  const createPostMutation = api.posts.create.useMutation({
    onSuccess: async () => {
      if (hasRedirect) {
        router.push(
          form.getValues("type") === "following"
            ? "/"
            : `/?tab=${form.getValues("type")}`,
        );
        // router.refresh();
        await context.posts.getPosts.invalidate({
          type: form.getValues("type"),
        });
      } else {
        await context.users.getUserProfile.invalidate();
        await context.posts.getUserPosts.reset();
      }
      form.reset();
    },
  });

  const { user } = useUser();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (searchParams.has("tab")) {
      form.setValue(
        "type",
        searchParams.get("tab") as (typeof POST_TYPE)[number],
      );
    } else {
      form.setValue("type", "following");
    }
  }, [searchParams]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isFocused) return;

      if (e.key === "Escape") {
        form.resetField("content");
        setIsFocused(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused, form]);

  return (
    <div
      // className="xs:flex hidden gap-x-4"
      className="flex gap-x-2"
    >
      {!user?.imageUrl ? (
        <Skeleton className="h-10 w-10 rounded-full" />
      ) : (
        <Link
          href={`/${user.username}`}
          className="relative aspect-square h-8 w-8 min-w-max xs:h-10 xs:w-10"
        >
          <Image
            src={user.imageUrl}
            alt="Profile picture"
            fill
            sizes="100%"
            className="rounded-full"
          />
        </Link>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await createPostMutation.mutateAsync(values);
          })}
          className="flex-1 space-y-4"
        >
          <div className="flex gap-x-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  {/* <FormLabel>Post</FormLabel> */}
                  <FormControl>
                    <div className="p-1 ">
                      {!isFocused ? (
                        <input
                          style={{
                            width: "100%",
                          }}
                          placeholder="What's on your mind?"
                          className="w-full text-base [all:unset]"
                          onFocus={() => setIsFocused(true)}
                        />
                      ) : (
                        <TextareaAutosize
                          style={{
                            width: "100%",
                          }}
                          placeholder="What's on your mind?"
                          className="text-base [all:unset]"
                          autoFocus
                          maxLength={256}
                          maxRows={6}
                          {...field}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isFocused && <Button disabled>Post</Button>}
          </div>

          {isFocused && (
            <div className="flex justify-between gap-x-2">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Post type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Privacy</SelectLabel>
                              {POST_TYPE_TABS.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.id === "following"
                                    ? "Follower"
                                    : type.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="flex-1 text-xs text-muted-foreground xs:text-sm">
                  This post will be visible to{" "}
                  {form.watch("type") === "following"
                    ? "your followers"
                    : form.watch("type") === "all"
                    ? "all campuses"
                    : "your " + form.watch("type")}
                </p>
              </div>

              <div className="flex gap-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    form.reset();
                    setIsFocused(false);
                  }}
                >
                  <Trash className="h-4 w-4 text-rose-500" />
                </Button>

                {/* {form.watch("type") !== "following" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" disabled={!form.formState.isValid}>
                        Post
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <p className="text-sm text-muted-foreground">
                        This post will be visible to{" "}
                        {form.watch("type") === "following"
                          ? "your followers"
                          : form.watch("type") === "all"
                          ? "all campuses"
                          : "your " + form.watch("type")}
                        .
                      </p>
                      <div className="flex justify-end gap-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => {
                            form.reset();
                            setIsFocused(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          type="submit"
                          disabled={
                            form.formState.isSubmitting ||
                            !form.formState.isValid
                          }
                        >
                          {form.formState.isSubmitting && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Post
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )} */}
                <Button
                  type="submit"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isValid
                  }
                >
                  {form.formState.isSubmitting && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
