"use client";

import type {
  Campus,
  College,
  Like,
  Comment,
  Post,
  Program,
} from "@/lib/db/schema";
import moment from "moment";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
// import UpdatePost from "./update-post";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { nanoid } from "nanoid";
import { Toggle } from "./ui/toggle";
import { cn } from "@/lib/utils";
import PostDropdown from "./post-dropdown";
import { api } from "@/lib/trpc/client";

export default function Post({
  post,
  isMyPost,
  userId,
}: {
  post: Post & {
    likes: Like[];
    comments: Comment[];
    user: User & {
      program: Program & { college: College & { campus: Campus } };
    };
  };
  isMyPost: boolean;
  userId: string;
}) {
  const [likes, setLikes] = useState<Like[]>(post.likes);
  const unlikeMutation = api.posts.unlike.useMutation({
    onMutate: ({ post_id }) =>
      setLikes(likes.filter((like) => like.user_id !== userId)),
  });
  const likeMutation = api.posts.like.useMutation({
    onMutate: ({ post_id }) =>
      setLikes([
        ...likes,
        {
          id: nanoid(),
          post_id,
          user_id: userId,
          created_at: new Date(),
        },
      ]),
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/${post.user.username}/${post.id}`);
        }}
        className="cursor-pointer space-y-2 border p-4"
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
                <p className="text-md line-clamp-1 flex-1 break-all font-medium">
                  @{post.user.username}
                </p>
                {/* <div className="flex items-center gap-x-1"> */}
                {/* {(() => {
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
                    })()} */}
                {/* <Tooltip delayDuration={250}>
                    <TooltipTrigger className="hidden xs:block">
                      <Badge>
                        {searchParams.get("tab") === "college"
                          ? post.user.program.college.slug.toUpperCase()
                          : post.user.program.college.campus.slug.toUpperCase()}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[12rem]">
                      {post.user.program.college.campus.name}
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
                  </Tooltip> */}
                {/* </div> */}

                <p className="pointer-events-none hidden select-none sm:block">
                  ·
                </p>
                <div className="hidden sm:block">
                  <Tooltip delayDuration={250}>
                    <TooltipTrigger>
                      <p className="text-xs">
                        {moment(post.created_at).fromNow()}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      {moment(post.created_at).format(
                        "MMMM Do YYYY, h:mm:ss A",
                      )}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="outline">
                  {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center gap-x-1 ">
                {/* {(() => {
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
                    })()} */}
                <Tooltip delayDuration={250}>
                  <TooltipTrigger className="hidden xs:block">
                    <Badge>
                      {searchParams.get("tab") === "college"
                        ? post.user.program.college.slug.toUpperCase()
                        : post.user.program.college.campus.slug.toUpperCase()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[12rem]">
                    {post.user.program.college.campus.name}
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

          {isMyPost && <PostDropdown post_id={post.id} />}
        </div>

        <p>
          {post.content.length > 512
            ? post.content.slice(0, 512) + "..."
            : post.content}
        </p>

        <div className="space-y-2">
          <div className="flex">
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

            {/* <Badge variant="outline">
              {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </Badge> */}
          </div>
        </div>
      </div>
    </>
  );
}
