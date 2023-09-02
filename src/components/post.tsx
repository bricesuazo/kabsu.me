"use client";

import type { Post, User } from "@/db/schema";
import moment from "moment";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Post({ post }: { post: Post & { user: User } }) {
  const router = useRouter();
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/${post.user.username}/${post.id}`);
      }}
      className="cursor-pointer space-y-2 border p-4"
    >
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
      <div className="flex items-center gap-x-2">
        <p>{post.post}</p>
        <p>·</p>
        <p>{moment(post.created_at).fromNow()}</p>
      </div>
    </div>
  );
}
