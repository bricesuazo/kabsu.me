import RefreshPage from "@/components/RefreshPage";
import PostComment from "@/components/post-comment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { db } from "@/db";
import { Comment } from "@/db/schema";
import { auth, clerkClient } from "@clerk/nextjs";
import {
  Album,
  Briefcase,
  GraduationCap,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import moment from "moment";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: { username: string; post_id: string };
}): Promise<Metadata> {
  const post = await db.query.posts.findFirst({
    where: (post, { eq }) => eq(post.id, params.post_id),
    with: {
      user: true,
    },
  });

  if (!post) notFound();

  return {
    title: `${post.content} - @${params.username}`,
  };
}

export default async function PostPage({
  params: { post_id },
}: {
  params: { post_id: string };
}) {
  const { userId } = auth();

  if (!userId) notFound();

  const post = await db.query.posts.findFirst({
    where: (post, { eq }) => eq(post.id, post_id),
    with: {
      likes: true,
      comments: {
        orderBy: (comment, { desc }) => desc(comment.created_at),
      },
      user: {
        with: {
          program: {
            with: {
              college: {
                with: { campus: true },
              },
            },
          },
        },
      },
    },
  });

  if (!post) notFound();

  const user = await clerkClient.users.getUser(post.user.id);

  return (
    <>
      {/* <UpdatePost open={openUpdate} setOpen={setOpenUpdate} post={post} /> */}
      {/* <DeletePost open={openDelete} setOpen={setOpenDelete} post_id={post.id} /> */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Link href={`/${user.username}`} className="flex gap-x-2">
            <div className="w-max">
              <Image
                src={user.imageUrl}
                alt="Image"
                width={60}
                height={60}
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col">
              <div className="group flex items-center gap-x-2">
                <p className="line-clamp-1 group-hover:underline">
                  {user.firstName} {user.lastName}{" "}
                </p>
                <div className="flex items-center gap-x-1">
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
                  <Tooltip delayDuration={250}>
                    <TooltipTrigger>
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
                @{user.username}
              </p>
            </div>
          </Link>

          {userId === post.user_id && (
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
              <DropdownMenuContent>
                <DropdownMenuLabel>Post</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem onClick={() => setOpenUpdate(true)}>
                  Edit
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  className="!text-red-500"
                  // onClick={() => setOpenDelete(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p>{post.content}</p>

        <PostComment userId={userId} post={post} />

        <div className="">
          {post.comments.map((comment) => (
            <Suspense key={comment.id}>
              <CommentComponent comment={comment} />
            </Suspense>
          ))}
        </div>
      </div>
    </>
  );
}

async function CommentComponent({ comment }: { comment: Comment }) {
  const { userId } = auth();
  const fullComment = await db.query.comments.findFirst({
    where: (c, { eq }) => eq(c.id, comment.id),
    with: {
      user: true,
    },
  });

  if (!fullComment) return null;

  const user = await clerkClient.users.getUser(fullComment.user_id);

  return (
    <>
      <RefreshPage />
      <div className="space-y-2 border p-4">
        <div className="flex justify-between">
          <div className="flex gap-x-2">
            <Link href={`/${user.username}`}>
              <Image src={user.imageUrl} alt="" width={40} height={40} />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-x-2">
                <p className="line-clamp-1 group-hover:underline">
                  {user.firstName} {user.lastName}{" "}
                </p>
                <p className="pointer-events-none hidden select-none sm:block">
                  ·
                </p>
                <div className="hidden sm:block">
                  <Tooltip delayDuration={250}>
                    <TooltipTrigger>
                      <p className="text-xs">
                        {moment(fullComment.created_at).fromNow()}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      {moment(fullComment.created_at).format(
                        "MMMM Do YYYY, h:mm:ss A",
                      )}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <p className="line-clamp-1 flex-1 break-all text-sm">
                @{user.username}
              </p>
            </div>
          </div>
          {fullComment.user_id === userId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <div className="">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <MoreVertical size="1rem" />
                    </Button>
                  </div>
                </DropdownMenuTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="!text-red-500"
                  // onClick={() => setOpenDelete(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p>{fullComment.content}</p>
      </div>
    </>
  );
}
