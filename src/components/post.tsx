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
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import DeletePost from "./delete-post";
import UpdatePost from "./update-post";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";

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
        <div className="flex items-center justify-between">
          <Link href={`/${post.user.username}`} className="flex gap-x-2">
            <div className="">
              <Image
                src={post.user.imageUrl}
                alt="Image"
                width={40}
                height={40}
                className="flex-1 rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-x-2">
                <p>
                  {post.user.firstName} {post.user.lastName}
                </p>

                <p className="pointer-events-none select-none">·</p>
                <p className="text-xs">{moment(post.created_at).fromNow()}</p>
              </div>
              <p className="text-sm">@{post.user.username}</p>
            </div>
          </Link>

          {isMyPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline">
                  <MoreVertical size="1rem" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <DropdownMenuLabel>Post</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setOpenUpdate(true)}>
                  Edit
                </DropdownMenuItem>
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
