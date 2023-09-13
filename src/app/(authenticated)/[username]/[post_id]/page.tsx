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
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { db } from "@/db";
import { auth, clerkClient } from "@clerk/nextjs";
import {
  Album,
  Briefcase,
  GraduationCap,
  Heart,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import moment from "moment";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  const post = await db.query.posts.findFirst({
    where: (post, { eq }) => eq(post.id, post_id),
    with: {
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
      <div className="space-y-2 border p-4">
        <div className="flex justify-between">
          <Link href={`/${user.username}`} className="flex gap-x-2">
            <div className="w-max">
              <Image
                src={user.imageUrl}
                alt="Image"
                width={40}
                height={40}
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
      </div>

      {/* <div className="space-y-2">
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

        <p className="text-sm text-muted-foreground">
          {optimisticLike.length} likes &mdash; {post.comments.length} comments
        </p>
      </div> */}
    </>
  );
}
