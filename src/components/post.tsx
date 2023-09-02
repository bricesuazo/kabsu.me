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

export default function Post({
  post,
  userId,
}: {
  post: Post & { user: User };
  userId: string | null;
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
          <div className="flex items-center gap-x-2">
            <Button
              asChild
              variant="link"
              className="h-auto p-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Link href={`/${post.user.username}`}>@{post.user.username}</Link>
            </Button>
            <p>·</p>
            <p className="text-xs">{moment(post.created_at).fromNow()}</p>
          </div>
          {post.user.id === userId && (
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

        <p>{post.post}</p>
      </div>
    </>
  );
}
