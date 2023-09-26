"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommentDropdown from "@/app/(authenticated)/[username]/[post_id]/comment-dropdown";
import PostComment from "@/components/post-comment";
import PostDropdown from "@/components/post-dropdown";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VerifiedBadge from "@/components/verified-badge";
import { api } from "@/lib/trpc/client";
import { formatText } from "@/lib/utils";
import { Album, Briefcase, GraduationCap } from "lucide-react";
import moment from "moment";
import momentTwitter from "moment-twitter";

import type { Comment } from "@cvsu.me/db/schema";

export default function PostPageComponent({ post_id }: { post_id: string }) {
  const postQuery = api.posts.getPost.useQuery({ post_id }, { retry: 1 });

  if (
    (postQuery.isSuccess && !postQuery.data) ||
    postQuery.error?.data?.code === "NOT_FOUND"
  ) {
    notFound();
  }

  return (
    <>
      {postQuery.isLoading ? (
        <div className="min-h-screen space-y-2 p-4">
          <div className="flex justify-between">
            <div className="flex gap-x-2">
              <div className="w-max">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="group flex items-center gap-x-1">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-1 w-1" />

                  <Skeleton className="h-3 w-10" />
                </div>
                <div className="flex items-center gap-x-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-12 rounded-full bg-primary" />
                  <Skeleton className="h-5 w-12 rounded-full border" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[...(Array(2) as number[])].map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-x-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>

            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-1">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-1 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="flex gap-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 flex-1 border bg-transparent" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      ) : !postQuery.data && postQuery.isError ? (
        <p className="text-center text-sm text-muted-foreground">
          {postQuery.error.message}
        </p>
      ) : (
        <div className="min-h-screen space-y-2">
          <div className="flex flex-col gap-y-4 p-4">
            <div className="flex justify-between">
              <Link
                href={`/${postQuery.data.post.user.username}`}
                className="flex gap-x-2"
              >
                <div className="w-max">
                  {postQuery.data.post.user.profile_picture_url ? (
                    <Image
                      src={postQuery.data.post.user.profile_picture_url}
                      alt="Image"
                      width={64}
                      height={64}
                      className="aspect-square rounded-full object-cover"
                    />
                  ) : (
                    <Image
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${postQuery.data.post.user.username}`}
                      alt="Logo"
                      width={64}
                      height={64}
                      className="aspect-square rounded-full object-cover"
                    />
                  )}
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
                        {postQuery.data.post.user.first_name}{" "}
                        {postQuery.data.post.user.last_name}{" "}
                      </p>
                    </div>

                    {postQuery.data.post.user.verified_at && <VerifiedBadge />}

                    <p className="pointer-events-none select-none">·</p>
                    <Tooltip delayDuration={250}>
                      <TooltipTrigger>
                        <p className="hidden text-xs text-muted-foreground hover:underline xs:block">
                          {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                            momentTwitter(
                              postQuery.data.post.created_at,
                            ).twitterLong()
                          }
                        </p>
                        <p className="text-xs text-muted-foreground hover:underline xs:hidden">
                          {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                            momentTwitter(
                              postQuery.data.post.created_at,
                            ).twitterShort()
                          }
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        {moment(postQuery.data.post.created_at).format(
                          "MMMM Do YYYY, h:mm:ss A",
                        )}
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
                            {postQuery.data.post.user.program.college.campus.slug.toUpperCase()}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[12rem]">
                          {postQuery.data.post.user.program.college.campus.name}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Badge variant="outline">
                            {postQuery.data.post.user.program.slug.toUpperCase()}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[12rem]">
                          {postQuery.data.post.user.program.name}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </Link>

              <PostDropdown
                post_id={postQuery.data.post.id}
                successUrl={`/${postQuery.data.post.user.username}`}
                isMyPost={postQuery.data.userId === postQuery.data.post.user_id}
              />
            </div>

            <div className="">{formatText(postQuery.data.post.content)}</div>

            <PostComment
              userId={postQuery.data.userId}
              post={postQuery.data.post}
              data-superjson
            />
          </div>

          <div>
            {postQuery.data.post.comments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CommentComponent({ comment }: { comment: Comment }) {
  const fullCommentQuery = api.comments.getFullComment.useQuery({
    comment_id: comment.id,
  });

  if (!fullCommentQuery.data || fullCommentQuery.isLoading)
    return (
      <div className="space-y-2 border p-4">
        <div className="flex justify-between">
          <div className="flex gap-x-2">
            <div className="min-w-max">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-x-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-1 w-1" />
                <div className="hidden sm:block">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Skeleton className="h-4" />
      </div>
    );

  return (
    <div className="space-y-2 border p-4">
      <div className="flex justify-between">
        <div className="flex gap-x-2">
          <div className="min-w-max">
            <Link href={`/${fullCommentQuery.data.comment.user.username}`}>
              {fullCommentQuery.data.comment.user.profile_picture_url ? (
                <Image
                  src={fullCommentQuery.data.comment.user.profile_picture_url}
                  alt=""
                  width={40}
                  height={40}
                  className="aspect-square rounded-full"
                />
              ) : (
                <Image
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${fullCommentQuery.data.comment.user.username}`}
                  alt=""
                  width={40}
                  height={40}
                  className="aspect-square rounded-full"
                />
              )}
            </Link>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-x-2">
              <Link
                href={`/${fullCommentQuery.data.comment.user.username}`}
                className="flex items-center gap-x-1"
              >
                <p className="line-clamp-1 font-bold group-hover:underline">
                  {fullCommentQuery.data.comment.user.first_name}{" "}
                  {fullCommentQuery.data.comment.user.last_name}{" "}
                </p>
                {fullCommentQuery.data.comment.user.verified_at && (
                  <VerifiedBadge size="sm" />
                )}
              </Link>
              <p className="pointer-events-none select-none">·</p>

              <Tooltip delayDuration={250}>
                <TooltipTrigger>
                  <p className="hidden text-xs text-muted-foreground hover:underline xs:block">
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                      momentTwitter(
                        fullCommentQuery.data.comment.created_at,
                      ).twitterLong()
                    }
                  </p>
                  <p className="text-xs text-muted-foreground hover:underline xs:hidden">
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                      momentTwitter(
                        fullCommentQuery.data.comment.created_at,
                      ).twitterShort()
                    }
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  {moment(fullCommentQuery.data.comment.created_at).format(
                    "MMMM Do YYYY, h:mm:ss A",
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
            <Link
              href={`/${fullCommentQuery.data.comment.user.username}`}
              className="line-clamp-1 flex-1 break-all text-sm text-foreground/70 hover:underline"
            >
              @{fullCommentQuery.data.comment.user.username}
            </Link>
          </div>
        </div>

        <CommentDropdown
          comment_id={comment.id}
          isMyComment={
            fullCommentQuery.data.comment.user_id ===
            fullCommentQuery.data.userId
          }
        />
      </div>
      <div>{formatText(fullCommentQuery.data.comment.content)}</div>
    </div>
  );
}
