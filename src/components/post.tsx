"use client";

import type { Post } from "@/db/schema";
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
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import DeletePost from "./delete-post";
import UpdatePost from "./update-post";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function Post({
  post,
  isMyPost,
}: {
  post: Post & { user: User };
  isMyPost: boolean;
}) {
  const router = useRouter();
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  return (
    <>
      <UpdatePost open={openUpdate} setOpen={setOpenUpdate} post={post} />
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
                  {/* {program && (
                    <div className="flex items-center gap-x-2">
                      <Badge>
                        {program.department.college.slug.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {program.slug.toUpperCase()}
                      </Badge>
                    </div>
                  )} */}
                </p>
                <p className="pointer-events-none hidden select-none sm:block">
                  ·
                </p>
                <div className="hidden sm:block">
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
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
                  </TooltipProvider>
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

        <p>{post.content}</p>
      </div>
    </>
  );
}
