"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { cn, formatText } from "@/lib/utils";
// import UpdatePost from "./update-post";
import type { User as UserFromClerk } from "@clerk/nextjs/server";
import {
  Album,
  Briefcase,
  GraduationCap,
  Heart,
  MessageCircle,
} from "lucide-react";
import moment from "moment";
import momentTwitter from "moment-twitter";
import { nanoid } from "nanoid";

import type {
  Campus,
  College,
  Comment,
  Like,
  Post,
  Program,
  User as UserFromDB,
} from "@cvsu.me/db/schema";

import PostDropdown from "./post-dropdown";
import { Badge } from "./ui/badge";
import { Toggle } from "./ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import VerifiedBadge from "./verified-badge";

export default function Post({
  post,
  isMyPost,
  userId,
}: {
  post: Post & {
    likes: Like[];
    comments: Comment[];
    user: UserFromDB &
      UserFromClerk & {
        program: Program & { college: College & { campus: Campus } };
      };
  };
  isMyPost: boolean;
  userId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [likes, setLikes] = useState<Like[]>(post.likes);
  const unlikeMutation = api.posts.unlike.useMutation({
    onMutate: ({ post_id }) => {
      setLikes(
        likes.filter(
          (like) => like.post_id !== post_id && like.user_id !== userId,
        ),
      );

      // await context.posts.getPosts.invalidate({
      //   type:
      //     ((searchParams.get("tab") as (typeof POST_TYPE)[number]) || null) ??
      //     "following",
      // });
    },
  });
  const likeMutation = api.posts.like.useMutation({
    onMutate: ({ post_id }) => {
      setLikes([
        ...likes,
        {
          id: nanoid(),
          post_id,
          user_id: userId,
          created_at: new Date(),
        },
      ]);

      // await context.posts.getPosts.invalidate({
      //   type:
      //     ((searchParams.get("tab") as (typeof POST_TYPE)[number]) || null) ??
      //     "following",
      // });
    },
  });

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/${post.user.username}/${post.id}`);
      }}
      className="cursor-pointer space-y-2 border-b p-4"
    >
      <div className="flex justify-between">
        <Link
          href={`/${post.user.username}`}
          onClick={(e) => e.stopPropagation()}
          className="flex gap-x-2"
        >
          <div className="w-max">
            <Image
              src={post.user.imageUrl}
              alt="Image"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-y-1">
            <div className="group flex items-center gap-x-2">
              {/* <p className="line-clamp-1 group-hover:underline">
                  {post.user.firstName} {post.user.lastName}{" "}
                </p> */}
              <div className="flex items-center gap-x-1">
                <p className="text-md line-clamp-1 flex-1 break-all font-medium">
                  @{post.user.username}
                </p>

                {post.user.verified_at && <VerifiedBadge size="sm" />}
              </div>

              <p className="pointer-events-none select-none">·</p>

              <Tooltip delayDuration={250}>
                <TooltipTrigger>
                  <p className="hidden text-xs text-muted-foreground hover:underline xs:block">
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                      momentTwitter(post.created_at).twitterLong()
                    }
                  </p>
                  <p className="text-xs text-muted-foreground hover:underline xs:hidden">
                    {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                      momentTwitter(post.created_at).twitterShort()
                    }
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  {moment(post.created_at).format("MMMM Do YYYY, h:mm:ss A")}
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-x-1 ">
              <Tooltip delayDuration={250}>
                <TooltipTrigger>
                  {(() => {
                    switch (post.user.type) {
                      case "student":
                        return <Album />;
                      case "alumni":
                        return <Briefcase />;
                      case "faculty":
                        return <GraduationCap />;
                      default:
                        return null;
                    }
                  })()}
                </TooltipTrigger>
                <TooltipContent className="max-w-[12rem]">
                  {post.user.type.charAt(0).toUpperCase() +
                    post.user.type.slice(1)}
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={250}>
                <TooltipTrigger>
                  <Badge>
                    {searchParams.get("tab") === "college"
                      ? post.user.program.college.slug.toUpperCase()
                      : post.user.program.college.campus.slug.toUpperCase()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-[12rem]">
                  {searchParams.get("tab") === "college"
                    ? post.user.program.college.name
                    : post.user.program.college.campus.name}
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={250}>
                <TooltipTrigger>
                  <Badge variant="outline">
                    {post.user.program.slug.toUpperCase()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-[12rem]">
                  {post.user.program.name}
                </TooltipContent>
              </Tooltip>
            </div>
            {/* <p className="line-clamp-1 flex-1 break-all text-sm">
                @{post.user.username}
              </p> */}
          </div>
        </Link>

        <PostDropdown post_id={post.id} isMyPost={isMyPost} />
      </div>

      <div className="">
        {formatText(
          post.content.length > 512
            ? post.content.slice(0, 512) + "..."
            : post.content,
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-x-1">
          <Toggle
            size="sm"
            pressed={likes.some((like) => like.user_id === userId)}
            onClick={(e) => e.stopPropagation()}
            onPressedChange={(pressed) => {
              if (pressed) {
                likeMutation.mutate({ post_id: post.id });
              } else {
                unlikeMutation.mutate({ post_id: post.id });
              }
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
            pressed={false}
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/${post.user.username}/${post.id}?comment`}>
              <MessageCircle className="h-4 w-4" />
            </Link>
          </Toggle>
        </div>

        <div className="flex items-center gap-x-4">
          <p className="text-sm text-muted-foreground">
            {`${likes.length} like${likes.length > 1 ? "s" : ""} — ${
              post.comments.length
            } comment${post.comments.length > 1 ? "s" : ""}`}
          </p>
          <Badge variant="outline" className="flex items-center gap-x-1">
            <p className="hidden xs:block">Privacy:</p>
            {post.type === "following"
              ? "Follower"
              : post.type.charAt(0).toUpperCase() + post.type.slice(1)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
