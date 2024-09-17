import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";
import { cn } from "@kabsu.me/ui";
import { Button } from "@kabsu.me/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@kabsu.me/ui/form";
import { Skeleton } from "@kabsu.me/ui/skeleton";
import { Toggle } from "@kabsu.me/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kabsu.me/ui/tooltip";

import VerifiedBadge from "~/components/verified-badge";
import { api } from "~/lib/trpc/client";
import {
  formatText,
} from "~/lib/utils";
import CommentDropdown from "~/app/(authenticated)/[username]/[post_id]/comment-dropdown";


export function CommentComponent({
  comment,
  userId,
  post_id,
  level = 0,
}: {
  comment: RouterOutputs["posts"]["getPost"]["post"]["comments"][number];
  userId: string;
  post_id: string;
  level?: number;
}) {
  const fullCommentQuery = api.comments.getFullComment.useQuery({
    comment_id: comment.id,
  });
  const [likes, setLikes] = useState(
    fullCommentQuery.data?.comment.likes ?? [],
  );
  const [replies, setReplies] = useState(
    fullCommentQuery.data?.comment.replies ?? [],
  );

  const likeCommentMutation = api.comments.like.useMutation();
  const unlikeCommentMutation = api.comments.unlike.useMutation();
  const replyCommentMutation = api.comments.reply.useMutation();

  useEffect(() => {
    setLikes(fullCommentQuery.data?.comment.likes ?? []);
  }, [fullCommentQuery.data?.comment.likes]);

  const form = useForm<{ is_comment_enabled: boolean; reply: string }>({
    resolver: zodResolver(
      z.object({
        is_comment_enabled: z.boolean(),
        reply: z.string().min(1, {
          message: "Comment cannot be empty.",
        }),
      }),
    ),
    defaultValues: {
      is_comment_enabled: level === 0 && replies.length > 0,
      reply: "",
    },
  });

  useEffect(() => {
    setReplies(fullCommentQuery.data?.comment.replies ?? []);

    form.setValue(
      "is_comment_enabled",
      level === 0 &&
        !!fullCommentQuery.data?.comment.replies.length &&
        fullCommentQuery.isFetchedAfterMount,
    );

    console.log(fullCommentQuery.data?.comment.replies);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullCommentQuery.data?.comment.replies, level]);

  return (
    <>
      {!fullCommentQuery.data ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="flex gap-x-2">
              <div className="min-w-max">
                <Skeleton className="size-8 rounded-full" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-x-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="size-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-1">
            <Skeleton className="h-8 w-10" />
            {level === 0 && <Skeleton className="h-8 w-10" />}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between">
            <div className="flex flex-1 gap-x-2">
              <Link href={`/${fullCommentQuery.data.comment.users.username}`}>
                <Image
                  src={
                    fullCommentQuery.data.comment.users.image_name
                      ? fullCommentQuery.data.comment.users.image_url
                      : "/default-avatar.jpg"
                  }
                  alt={`${fullCommentQuery.data.comment.users.name} profile picture`}
                  width={32}
                  height={32}
                  className="aspect-square rounded-full object-cover object-center"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-start">
                <div className="flex items-center gap-x-2">
                  <div className="flex items-center gap-x-1">
                    <Link
                      href={`/${fullCommentQuery.data.comment.users.username}`}
                      className="line-clamp-1 min-w-10 break-all text-sm font-medium hover:underline"
                    >
                      {fullCommentQuery.data.comment.users.name}
                    </Link>
                    {fullCommentQuery.data.comment.users.verified_at && (
                      <VerifiedBadge size="sm" />
                    )}
                  </div>
                  <p className="pointer-events-none select-none">·</p>
                  <Link
                    href={`/${fullCommentQuery.data.comment.users.username}`}
                    className="line-clamp-1 min-w-10 break-all text-sm text-foreground/70 hover:underline"
                  >
                    @{fullCommentQuery.data.comment.users.username}
                  </Link>
                </div>
                <Tooltip delayDuration={250}>
                  <TooltipTrigger asChild className="w-fit">
                    <p className="line-clamp-1 cursor-pointer break-all text-xs text-muted-foreground hover:underline">
                      {formatDistanceToNow(
                        fullCommentQuery.data.comment.created_at,
                        {
                          includeSeconds: true,
                          addSuffix: true,
                        },
                      )}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    {format(fullCommentQuery.data.comment.created_at, "PPpp")}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <CommentDropdown
              comment_id={comment.id}
              isMyComment={
                fullCommentQuery.data.comment.user_id ===
                fullCommentQuery.data.userId
              }
              level={level}
            />
          </div>
          <div className="whitespace-pre-wrap break-words text-sm">
            {formatText(fullCommentQuery.data.comment.content)}
          </div>

          <div className="flex gap-x-1">
            <Toggle
              size="sm"
              className="h-8 px-2"
              pressed={likes.some((like) => like.user_id === userId)}
              onClick={(e) => e.stopPropagation()}
              onPressedChange={async (pressed) => {
                if (pressed) {
                  setLikes([...likes, { user_id: userId }]);

                  await likeCommentMutation.mutateAsync({
                    comment_id: comment.id,
                  });
                } else {
                  setLikes(likes.filter((like) => like.user_id !== userId));

                  await unlikeCommentMutation.mutateAsync({
                    comment_id: comment.id,
                  });
                }
                await fullCommentQuery.refetch();
              }}
            >
              <Heart
                className={cn(
                  "mr-1.5 size-4",
                  likes.some((like) => like.user_id === userId) &&
                    "fill-primary text-primary",
                )}
              />
              <span className="text-xs">{likes.length}</span>
            </Toggle>

            {level === 0 && (
              <Toggle
              size="sm"
              className="h-8 px-2"
              pressed={form.watch("is_comment_enabled")}
              onPressedChange={(pressed) => {
                  form.setValue("is_comment_enabled", pressed);
                  form.resetField("reply");
              }}
              >
              <MessageCircle className="mr-1.5 size-4" />
              <span className="text-xs">
                  {fullCommentQuery.data.comment.replies.length}
              </span>
              </Toggle>
            )}
          </div>
          <div className="space-y-1 pl-5 sm:pl-10">
            {fullCommentQuery.data.comment.replies.map((reply) => (
              <CommentComponent
                key={reply.id}
                userId={userId}
                comment={reply}
                post_id={post_id}
                level={level + 1}
              />
            ))}
            {form.watch("is_comment_enabled") && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(async (values) => {
                    await replyCommentMutation.mutateAsync({
                      comment_id: comment.id,
                      content: values.reply,
                      post_id,
                      level,
                    });
                    form.reset();
                    await fullCommentQuery.refetch();
                  })}
                >
                  <FormField
                    control={form.control}
                    name="reply"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <FormControl className="flex-1">
                            <TextareaAutosize
                              {...field}
                              placeholder="Reply"
                              disabled={form.formState.isSubmitting}
                              rows={1}
                              maxRows={3}
                              className="flex w-full flex-1 resize-none rounded-md border border-input bg-background px-3 py-1.5 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </FormControl>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={
                              form.formState.isSubmitting ||
                              !form.formState.isValid
                            }
                          >
                            {form.formState.isSubmitting
                              ? "Replying..."
                              : "Reply"}
                          </Button>
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </div>
        </div>
      )}
    </>
  );
}