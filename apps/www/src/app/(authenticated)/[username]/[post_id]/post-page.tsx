"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, formatDistanceToNow } from "date-fns";
import {
  Album,
  Briefcase,
  GraduationCap,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { PhotoProvider, PhotoView } from "react-photo-view";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";
import { cn } from "@kabsu.me/ui";
import { Badge } from "@kabsu.me/ui/badge";
import { Button } from "@kabsu.me/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kabsu.me/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@kabsu.me/ui/form";
import { ScrollArea } from "@kabsu.me/ui/scroll-area";
import { Separator } from "@kabsu.me/ui/separator";
import { Skeleton } from "@kabsu.me/ui/skeleton";
import { Toggle } from "@kabsu.me/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kabsu.me/ui/tooltip";

import { CommentComponent } from "~/components/comment";
import { Icons } from "~/components/icons";
import PostDropdown from "~/components/post-dropdown";
import PostShare from "~/components/post-share";
import VerifiedBadge from "~/components/verified-badge";
import { api } from "~/lib/trpc/client";
import {
  FormattedContent,
  FormattedContentTextOnly,
} from "~/lib/utils";

export default function PostPageComponent({
  getPost,
  username,
  post_id,
}: {
  getPost: RouterOutputs["posts"]["getPost"];
  username: string;
  post_id: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postQuery = api.posts.getPost.useQuery(
    { username, post_id },
    { retry: 1, initialData: getPost },
  );
  const [isFocused, setIsFocused] = useState(
    searchParams.get("comment")?.length === 0 ? true : false,
  );
  const [openLikes, setOpenLikes] = useState(false);
  const getLikesInPostQuery = api.posts.getLikesInPost.useQuery(
    {
      post_id: post_id,
    },
    {
      enabled: openLikes,
    },
  );
  const likePostMutation = api.posts.like.useMutation({
    onSuccess: () => postQuery.refetch(),
  });
  const unlikePostMutation = api.posts.unlike.useMutation({
    onSuccess: () => postQuery.refetch(),
  });
  const getCurrentUserQuery = api.auth.getCurrentUser.useQuery();
  const createCommentMutation = api.comments.create.useMutation();

  const [likes, setLikes] = useState(postQuery.data.post.likes);

  const form = useForm<{ comment: string }>({
    resolver: zodResolver(
      z.object({
        comment: z.string().min(1, {
          message: "Comment cannot be empty.",
        }),
      }),
    ),
    defaultValues: {
      comment: "",
    },
  });

  useEffect(() => {
    setLikes(postQuery.data.post.likes);
  }, [postQuery.data.post.likes]);

  useEffect(() => {
    form.reset();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await createCommentMutation.mutateAsync({
      post_id,
      content: values.comment,
    });
    await postQuery.refetch();

    form.reset();
    setIsFocused(false);
    if (searchParams.has("comment")) router.push(`/${username}/${post_id}`);
  });

  if (postQuery.error?.data?.code === "NOT_FOUND") notFound();

  return (
    <>
      {postQuery.error ? (
        <p className="text-center text-sm text-muted-foreground">
          {postQuery.error.message}
        </p>
      ) : (
        <>
          <div>
            <div className="flex flex-col gap-y-4 p-4">
              <div className="flex justify-between">
                <Link
                  href={`/${postQuery.data.post.user.username}`}
                  className="flex gap-x-2"
                >
                  <div className="w-max">
                    <Image
                      src={
                        postQuery.data.post.user.image_name
                          ? postQuery.data.post.user.image_url
                          : "/default-avatar.jpg"
                      }
                      alt={`${postQuery.data.post.user.name} profile picture`}
                      width={56}
                      height={56}
                      className="aspect-square rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-x-2">
                      <div className="flex gap-x-1">
                        {(() => {
                          switch (postQuery.data.post.user.type) {
                            case "student":
                              return <Album />;
                            case "alumni":
                              return <GraduationCap />;
                            case "faculty":
                              return <Briefcase />;
                            default:
                              return null;
                          }
                        })()}
                        <p className="line-clamp-1 font-semibold hover:underline">
                          {postQuery.data.post.user.name}
                        </p>
                      </div>

                      {postQuery.data.post.user.verified_at && (
                        <VerifiedBadge />
                      )}

                      <p className="pointer-events-none select-none">·</p>
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <p className="hidden text-xs text-muted-foreground hover:underline xs:block">
                            {formatDistanceToNow(
                              postQuery.data.post.created_at,
                              {
                                includeSeconds: true,
                                addSuffix: true,
                              },
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground hover:underline xs:hidden">
                            {formatDistanceToNow(
                              postQuery.data.post.created_at,
                              {
                                includeSeconds: true,
                                addSuffix: true,
                              },
                            )}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(postQuery.data.post.created_at, "PPpp")}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <p className="line-clamp-1 break-all text-sm text-foreground/70 hover:underline">
                        @{postQuery.data.post.user.username}{" "}
                      </p>
                      <div className="flex items-center gap-x-1">
                        <Tooltip delayDuration={250}>
                          <TooltipTrigger>
                            <Badge>
                              {postQuery.data.post.user.programs?.colleges?.campuses?.slug.toUpperCase()}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[12rem]">
                            {
                              postQuery.data.post.user.programs?.colleges
                                ?.campuses?.name
                            }
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip delayDuration={250}>
                          <TooltipTrigger>
                            <Badge variant="outline">
                              {postQuery.data.post.user.programs?.slug.toUpperCase()}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[12rem]">
                            {postQuery.data.post.user.programs?.name}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </Link>

                <PostDropdown
                  post_id={postQuery.data.post.id}
                  successUrl={`/${postQuery.data.post.user.username}`}
                  isMyPost={
                    postQuery.data.userId === postQuery.data.post.user_id
                  }
                />
              </div>

              <div className="whitespace-pre-wrap break-words">
                <FormattedContent
                  text={postQuery.data.post.content}
                  mentioned_users={postQuery.data.mentioned_users}
                />
              </div>

              <PhotoProvider>
                {postQuery.data.post.posts_images.length > 0 && (
                  <div
                    className={cn(
                      "grid grid-cols-3 gap-2",
                      postQuery.data.post.posts_images.length === 1 &&
                        "grid-cols-1",
                      postQuery.data.post.posts_images.length === 2 &&
                        "grid-cols-2",
                      postQuery.data.post.posts_images.length > 3 &&
                        "grid-cols-3",
                    )}
                  >
                    {postQuery.data.post.posts_images.map((image) => (
                      <PhotoView key={image.id} src={image.signed_url}>
                        <Image
                          src={image.signed_url}
                          alt={image.name}
                          width={400}
                          height={400}
                          priority
                          className="aspect-square rounded-lg object-cover"
                        />
                      </PhotoView>
                    ))}
                  </div>
                )}
              </PhotoProvider>

              <div className="space-y-2">
                <div className="flex gap-x-1">
                  <Toggle
                    size="sm"
                    pressed={likes.some(
                      (like) => like.user_id === postQuery.data.userId,
                    )}
                    onClick={(e) => e.stopPropagation()}
                    onPressedChange={async (pressed) => {
                      if (pressed) {
                        setLikes([
                          ...likes,
                          {
                            post_id,
                            user_id: postQuery.data.userId,
                          },
                        ]);

                        await likePostMutation.mutateAsync({
                          post_id,
                          userId: postQuery.data.userId,
                        });
                      } else {
                        setLikes(
                          likes.filter(
                            (like) => like.user_id !== postQuery.data.userId,
                          ),
                        );

                        await unlikePostMutation.mutateAsync({
                          post_id,
                          userId: postQuery.data.userId,
                        });
                      }
                      await getLikesInPostQuery.refetch();
                    }}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        likes.some(
                          (like) => like.user_id === postQuery.data.userId,
                        ) && "fill-primary text-primary",
                      )}
                    />
                  </Toggle>

                  <Toggle
                    size="sm"
                    pressed={isFocused}
                    onPressedChange={(pressed) => {
                      setIsFocused(pressed);
                      if (pressed) {
                        router.push(`/${username}/${post_id}?comment`);
                      } else {
                        router.push(`/${username}/${post_id}`);
                      }
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Toggle>

                  <PostShare
                    data={{
                      image: postQuery.data.post.user.image_name
                        ? postQuery.data.post.user.image_url
                        : "",
                      username: postQuery.data.post.user.username,
                      name: postQuery.data.post.user.name,
                      content: FormattedContentTextOnly({
                        text: postQuery.data.post.content,
                        mentioned_users: postQuery.data.mentioned_users,
                      }),
                      likes: likes.length.toString(),
                      comments: postQuery.data.post.comments.length.toString(),
                      privacy: postQuery.data.post.type,
                      campus:
                        postQuery.data.post.user.programs?.colleges?.campuses
                          ?.slug ?? "",
                      program: postQuery.data.post.user.programs?.slug ?? "",
                      verified: !!postQuery.data.post.user.verified_at,
                      images: postQuery.data.post.posts_images.map(
                        (image) => image.signed_url,
                      ),
                    }}
                  />
                </div>

                <div className="flex items-center gap-x-2">
                  <Dialog open={openLikes} onOpenChange={setOpenLikes}>
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
                      {postQuery.data.post.likes.length === 0 ||
                      getLikesInPostQuery.data?.length === 0 ? (
                        <p>No likes yet.</p>
                      ) : getLikesInPostQuery.isLoading ||
                        getLikesInPostQuery.isFetching ? (
                        <ScrollArea className="max-h-96">
                          {[
                            ...(Array(
                              postQuery.data.post.likes.length,
                            ) as number[]),
                          ].map((_, i) => (
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
                                  src={
                                    like.user.image_name
                                      ? like.user.image_url
                                      : "/default-avatar.jpg"
                                  }
                                  alt={`${like.user.name} profile picture`}
                                  width={40}
                                  height={40}
                                  className="aspect-square rounded-full object-cover object-center"
                                />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <div className="flex gap-x-1">
                                    <p className="line-clamp-1">
                                      {like.user.name}
                                    </p>

                                    {like.user.verified_at && (
                                      <VerifiedBadge size="md" />
                                    )}

                                    <Tooltip delayDuration={250}>
                                      {(() => {
                                        switch (like.user.type) {
                                          case "student":
                                            return (
                                              <>
                                                <TooltipTrigger>
                                                  <Album />
                                                </TooltipTrigger>
                                                <TooltipContent className="z-50">
                                                  Student
                                                </TooltipContent>
                                              </>
                                            );
                                          case "alumni":
                                            return (
                                              <>
                                                <TooltipTrigger>
                                                  <GraduationCap />
                                                </TooltipTrigger>
                                                <TooltipContent className="z-50">
                                                  Alumni
                                                </TooltipContent>
                                              </>
                                            );
                                          case "faculty":
                                            return (
                                              <>
                                                <TooltipTrigger>
                                                  <Briefcase />
                                                </TooltipTrigger>
                                                <TooltipContent className="z-50">
                                                  Faculty
                                                </TooltipContent>
                                              </>
                                            );
                                          default:
                                            return null;
                                        }
                                      })()}
                                    </Tooltip>
                                  </div>
                                  <div className="ml-2 hidden gap-x-2 group-hover:underline md:flex">
                                    <Tooltip delayDuration={250}>
                                      <TooltipTrigger>
                                        <Badge>
                                          {like.user.programs?.colleges?.campuses?.slug.toUpperCase()}
                                        </Badge>
                                        <TooltipContent className="max-w-[12rem]">
                                          {
                                            like.user.programs?.colleges
                                              ?.campuses?.name
                                          }
                                        </TooltipContent>
                                      </TooltipTrigger>
                                    </Tooltip>
                                    <Tooltip delayDuration={250}>
                                      <TooltipTrigger>
                                        <Badge variant="outline">
                                          {like.user.programs?.slug.toUpperCase()}
                                        </Badge>
                                        <TooltipContent className="max-w-[12rem]">
                                          {like.user.programs?.name}
                                        </TooltipContent>
                                      </TooltipTrigger>
                                    </Tooltip>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <p className="line-clamp-1 break-all text-sm">
                                    @{like.user.username}
                                  </p>
                                  <div className="ml-2 flex gap-x-2 group-hover:underline md:hidden">
                                    <Tooltip delayDuration={250}>
                                      <TooltipTrigger>
                                        <Badge className="hidden xs:block">
                                          {like.user.programs?.colleges?.campuses?.slug.toUpperCase()}
                                        </Badge>
                                        <TooltipContent className="max-w-[12rem]">
                                          {
                                            like.user.programs?.colleges
                                              ?.campuses?.name
                                          }
                                        </TooltipContent>
                                      </TooltipTrigger>
                                    </Tooltip>
                                    <Tooltip delayDuration={250}>
                                      <TooltipTrigger>
                                        <Badge variant="outline">
                                          {like.user.programs?.slug.toUpperCase()}
                                        </Badge>
                                        <TooltipContent className="max-w-[12rem]">
                                          {like.user.programs?.name}
                                        </TooltipContent>
                                      </TooltipTrigger>
                                    </Tooltip>
                                  </div>
                                </div>
                                <div className="flex-1 space-x-2"></div>
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
                    {`${postQuery.data.post.comments.length} comment${
                      postQuery.data.post.comments.length > 1 ? "s" : ""
                    }`}
                  </p>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-x-1"
                  >
                    <p className="hidden xs:block">Privacy:</p>
                    {postQuery.data.post.type === "following"
                      ? "Follower"
                      : postQuery.data.post.type.charAt(0).toUpperCase() +
                        postQuery.data.post.type.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator orientation="horizontal" />
          </div>

          <div className="space-y-4 p-4 pb-40">
            {postQuery.data.post.comments.length === 0 ? (
              <div className="flex justify-center">
                <p className="text-muted-foreground">No comments yet.</p>
              </div>
            ) : (
              postQuery.data.post.comments.map((comment) => (
                <CommentComponent
                  key={comment.id}
                  comment={comment}
                  userId={postQuery.data.userId}
                  post_id={postQuery.data.post.id}
                />
              ))
            )}
          </div>

          <div className="container fixed bottom-0 flex items-center gap-x-2 bg-card p-4">
            <div className="min-w-max">
              {getCurrentUserQuery.data ? (
                <Image
                  src={
                    getCurrentUserQuery.data.image_name
                      ? getCurrentUserQuery.data.image_url
                      : "/default-avatar.jpg"
                  }
                  alt="Image"
                  width={36}
                  height={36}
                  className="aspect-square rounded-full object-cover object-center"
                />
              ) : (
                <Skeleton className="size-9 rounded-full object-cover object-center" />
              )}
            </div>

            <Form {...form}>
              <form onSubmit={handleSubmit} className="flex w-full gap-x-2">
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 items-center gap-2 space-y-0">
                      <FormControl>
                        <TextareaAutosize
                          {...field}
                          placeholder="Write a comment..."
                          autoFocus
                          disabled={form.formState.isSubmitting}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              e.preventDefault();
                              await handleSubmit();
                            }
                          }}
                          rows={1}
                          maxRows={3}
                          className="flex w-full flex-1 resize-none rounded-md border border-input bg-background px-3 py-1.5 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={
                          form.formState.isSubmitting || !form.formState.isValid
                        }
                      >
                        {form.formState.isSubmitting && (
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Comment
                      </Button>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </>
      )}
    </>
  );
}