"use client";

import type {
  Campus,
  College,
  Like,
  Comment,
  Post,
  Program,
} from "@/db/schema";
import moment from "moment";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { useState, experimental_useOptimistic as useOptimistic } from "react";
import DeletePost from "./delete-post";
// import UpdatePost from "./update-post";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { nanoid } from "nanoid";
import { likePost, unlikePost } from "@/actions/post";
import { Toggle } from "./ui/toggle";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const [openDelete, setOpenDelete] = useState(false);
  // const [openUpdate, setOpenUpdate] = useState(false);
  const [optimisticLike, setOptimisticLike] = useOptimistic<Like[]>(post.likes);

  return (
    <>
      {/* <UpdatePost open={openUpdate} setOpen={setOpenUpdate} post={post} /> */}
      <DeletePost open={openDelete} setOpen={setOpenDelete} post_id={post.id} />
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
            onClick={(e) => {
              e.stopPropagation();
            }}
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
            <div className="flex flex-1 flex-col">
              <div className="group flex items-center gap-x-2">
                <p className="line-clamp-1 group-hover:underline">
                  {post.user.firstName} {post.user.lastName}{" "}
                </p>
                <div className="flex items-center gap-x-1">
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
                        {post.user.program.college.campus.slug.toUpperCase()}
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
              </div>
              <p className="line-clamp-1 flex-1 break-all text-sm">
                @{post.user.username}
              </p>
            </div>
          </Link>

          {isMyPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                  >
                    <MoreHorizontal size="1rem" />
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <DropdownMenuLabel>Post</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem onClick={() => setOpenUpdate(true)}>
                  Edit
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  className="!text-red-500"
                  onClick={() => setOpenDelete(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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

            <Toggle size="sm" pressed={false}>
              <MessageCircle className="h-4 w-4" />
            </Toggle>
          </div>

          <div className="flex items-center gap-x-4">
            <p className="text-sm text-muted-foreground">
              {optimisticLike.length} like{optimisticLike.length > 1 && "s"}{" "}
              &mdash; {post.comments.length} comment
              {post.comments.length > 1 && "s"}
            </p>

            {/* <p className="text-xs text-muted-foreground">Privacy:</p> */}
            <Badge variant="outline">
              {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}
