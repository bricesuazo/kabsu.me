"use client";

import { nanoid } from "nanoid";
import { Toggle } from "./ui/toggle";
import { experimental_useOptimistic as useOptimistic, useState } from "react";
import { Comment, Like, Post } from "@/db/schema";
import { likePost, unlikePost } from "@/actions/post";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

export default function PostComment({
  userId,
  post,
}: {
  userId: string;
  post: Post & { likes: Like[]; comments: Comment[] };
}) {
  const [isFocused, setIsFocused] = useState(false);
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

  const [optimisticLike, setOptimisticLike] = useOptimistic<Like[]>(post.likes);
  const { user } = useUser();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex">
          <Toggle
            size="sm"
            pressed={optimisticLike.some((like) => like.user_id === userId)}
            onClick={(e) => e.stopPropagation()}
            onPressedChange={async (pressed) => {
              if (pressed) {
                setOptimisticLike([
                  ...optimisticLike,
                  {
                    id: nanoid(),
                    post_id: post.id,
                    user_id: userId,
                    created_at: new Date(),
                  },
                ]);

                await likePost({ post_id: post.id });
              } else {
                setOptimisticLike(
                  optimisticLike.filter((like) => like.user_id !== userId),
                );

                await unlikePost({ post_id: post.id });
              }
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                optimisticLike.some((like) => like.user_id === userId) &&
                  "fill-primary text-primary",
              )}
            />
          </Toggle>

          <Toggle
            size="sm"
            pressed={isFocused}
            onPressedChange={(pressed) => setIsFocused(pressed)}
          >
            <MessageCircle className="h-4 w-4" />
          </Toggle>
        </div>

        <p className="text-sm text-muted-foreground">
          {optimisticLike.length} likes &mdash; {post.comments.length} comments
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        {isFocused ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                console.log(values);
              })}
              className="w-full"
            >
              <div className="flex w-full gap-x-2">
                <div className="">
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
            <div className="">
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
