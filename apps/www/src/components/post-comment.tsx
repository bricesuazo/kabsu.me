"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, MessageCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Comment, Like, Post } from "@cvsu.me/db/schema";

import { Icons } from "./icons";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";
import { Toggle } from "./ui/toggle";

export default function PostComment({
  userId,
  post,
}: {
  userId: string;
  post: Post & { likes: Like[]; comments: Comment[] };
}) {
  const context = api.useContext();
  const [open, setOpen] = useState(false);
  const likePostMutation = api.posts.like.useMutation({
    onSuccess: async () =>
      await context.posts.getPost.invalidate({ post_id: post.id }),
  });
  const unlikePostMutation = api.posts.unlike.useMutation({
    onSuccess: async () =>
      await context.posts.getPost.invalidate({ post_id: post.id }),
  });
  const createCommentMutation = api.comments.create.useMutation();
  const getLikesInPostQuery = api.posts.getLikesInPost.useQuery(
    {
      post_id: post.id,
    },
    {
      enabled: open,
    },
  );
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [likes, setLikes] = useState<Like[]>(post.likes);
  // TODO: Fix optimistic updates
  // const [optimisticLike, setOptimisticLike] = useOptimistic<Like[]>(post.likes);

  const [isFocused, setIsFocused] = useState(
    searchParams.get("comment")?.length === 0 ? true : false,
  );
  const form = useForm<{ comment: string }>({
    resolver: zodResolver(
      z.object({
        comment: z.string().nonempty({
          message: "Comment cannot be empty.",
        }),
      }),
    ),
    defaultValues: {
      comment: "",
    },
  });

  const { user } = useUser();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isFocused) return;

      if (e.key === "Escape") {
        form.reset();
        setIsFocused(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused, form]);

  useEffect(() => {
    form.reset();
  }, [isFocused, form]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-x-1">
          <Toggle
            size="sm"
            pressed={likes.some((like) => like.user_id === userId)}
            onClick={(e) => e.stopPropagation()}
            onPressedChange={async (pressed) => {
              if (pressed) {
                setLikes([
                  ...likes,
                  {
                    id: nanoid(),
                    post_id: post.id,
                    user_id: userId,
                    created_at: new Date(),
                  },
                ]);

                await likePostMutation.mutateAsync({ post_id: post.id });
              } else {
                setLikes(likes.filter((like) => like.user_id !== userId));

                await unlikePostMutation.mutateAsync({ post_id: post.id });
              }
              await getLikesInPostQuery.refetch();
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                likes.some((like) => like.user_id === userId) &&
                  "fill-primary text-primary",
              )}
            />
          </Toggle>

          <Toggle
            size="sm"
            pressed={isFocused}
            onPressedChange={(pressed) => {
              setIsFocused(pressed);
              if (pressed) {
                router.push(
                  `/${params.username as string}/${
                    params.post_id as string
                  }?comment`,
                );
              } else {
                router.push(
                  `/${params.username as string}/${params.post_id as string}`,
                );
              }
            }}
          >
            <MessageCircle className="h-4 w-4" />
          </Toggle>
        </div>

        <div className="flex items-center gap-x-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="text-sm text-muted-foreground hover:underline">
                {`${likes.length} like${likes.length > 1 ? "s" : ""}`}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-x-2">
                  <p>Likes</p>
                  <Badge>{likes.length}</Badge>
                </DialogTitle>
              </DialogHeader>
              {post.likes.length === 0 ||
              getLikesInPostQuery.data?.length === 0 ? (
                <p>No likes yet.</p>
              ) : getLikesInPostQuery.isLoading ||
                getLikesInPostQuery.isFetching ? (
                <ScrollArea className="max-h-96">
                  {[...(Array(post.likes.length) as number[])].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-x-2 rounded p-2"
                    >
                      <div className="min-w-max">
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>
                      <div className="mb-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <ScrollArea className="max-h-96">
                  {getLikesInPostQuery.data?.map((like) => (
                    <Link
                      href={`/${like.user.username}`}
                      key={like.id}
                      className="flex items-center gap-x-2 rounded p-2 hover:bg-muted"
                    >
                      <div className="min-w-max">
                        <Image
                          src={like.user.imageUrl}
                          alt="Image"
                          width={40}
                          height={40}
                          className="aspect-square rounded-full"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="line-clamp-1 group-hover:underline">
                          {like.user.firstName} {like.user.lastName}{" "}
                        </p>
                        <p className="line-clamp-1 flex-1 break-all text-sm">
                          @{like.user.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </ScrollArea>
              )}
            </DialogContent>
          </Dialog>
          <p className="pointer-events-none select-none text-sm text-muted-foreground">
            —
          </p>
          <p className="text-sm text-muted-foreground">
            {`${post.comments.length} comment${
              post.comments.length > 1 ? "s" : ""
            }`}
          </p>
          <Badge variant="outline" className="flex items-center gap-x-1">
            <p className="hidden xs:block">Privacy:</p>
            {post.type === "following"
              ? "Follower"
              : post.type.charAt(0).toUpperCase() + post.type.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {isFocused ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                await createCommentMutation.mutateAsync({
                  post_id: post.id,
                  content: values.comment,
                });
                await context.posts.getPost.invalidate({ post_id: post.id });

                form.reset();
                setIsFocused(false);
                searchParams.has("comment") &&
                  router.push(
                    `/${params.username as string}/${params.post_id as string}`,
                  );
              })}
              className="w-full"
            >
              <div className="flex w-full gap-x-2">
                <div className="min-w-max">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="Image"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <Skeleton className="h-10 w-10 rounded-full" />
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Write a comment..."
                          autoFocus
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <div className="">
                          <FormMessage />
                        </div>

                        <Button
                          type="submit"
                          size="sm"
                          className="w-fit"
                          disabled={
                            form.formState.isSubmitting ||
                            !form.formState.isValid
                          }
                        >
                          {form.formState.isSubmitting && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Comment
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex w-full gap-x-2">
            <div className="min-w-max">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Image"
                  width={40}
                  height={40}
                  className="aspect-square rounded-full"
                />
              ) : (
                <Skeleton className="h-10 w-10 rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <Input
                placeholder="Write a comment..."
                onFocus={() => setIsFocused(true)}
              />
            </div>

            <Button size="sm" disabled>
              Comment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
