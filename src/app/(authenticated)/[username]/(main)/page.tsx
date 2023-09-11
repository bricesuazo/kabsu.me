import Post from "@/components/post";
import { db } from "@/db";
import { auth, clerkClient } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LoadMoreUserPost } from "@/components/load-more-my-post";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Album, Briefcase, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import EditProfile from "@/components/edit-profile";
import FollowButton from "@/components/follow-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function generateMetadata({
  params,
}: {
  params: { username: string };
}): Metadata {
  return {
    title: `@${params.username}`,
  };
}

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const { userId } = auth();

  const users = await clerkClient.users.getUserList({
    username: [username],
  });

  const user = users[0];

  if (!user) notFound();

  const userFromDB = await db.query.users.findFirst({
    where: (userDB, { eq }) => eq(userDB.id, user.id),

    with: {
      program: { with: { college: { with: { campus: true } } } },
    },
  });

  if (!userFromDB) notFound();

  const posts = await db.query.posts.findMany({
    where: (post, { and, eq, isNull }) =>
      and(isNull(post.deleted_at), eq(post.user_id, user.id)),
    orderBy: (post, { desc }) => desc(post.created_at),
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

  const usersFromPosts = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.user.id),
  });

  const followers = await db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.followee_id, user.id),
  });

  const followees = await db.query.followees.findMany({
    where: (followee, { eq }) => eq(followee.followee_id, user.id),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex gap-x-8">
          <div className="flex-1 ">
            <div className="flex items-center gap-x-2">
              <Tooltip delayDuration={250}>
                {(() => {
                  if (userFromDB.type === "student") {
                    return (
                      <>
                        <TooltipTrigger>
                          <Album />
                        </TooltipTrigger>
                        <TooltipContent>Student</TooltipContent>
                      </>
                    );
                  } else if (userFromDB.type === "alumni") {
                    return (
                      <>
                        <TooltipTrigger>
                          <GraduationCap />
                        </TooltipTrigger>
                        <TooltipContent>Alumni</TooltipContent>
                      </>
                    );
                  } else if (userFromDB.type === "faculty") {
                    return (
                      <>
                        <TooltipTrigger>
                          <Briefcase />
                        </TooltipTrigger>
                        <TooltipContent>Faculty</TooltipContent>
                      </>
                    );
                  }
                })()}
              </Tooltip>

              <Tooltip delayDuration={250}>
                <TooltipTrigger>
                  <Badge>
                    {userFromDB.program.college.campus.slug.toUpperCase()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-60">
                  {userFromDB.program.college.campus.name}
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={250}>
                <TooltipTrigger>
                  <Badge variant="outline">
                    {userFromDB.program.slug.toUpperCase()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-60">
                  {userFromDB.program.name}
                </TooltipContent>
              </Tooltip>
            </div>

            <h2 className="text-4xl font-semibold">@{user.username}</h2>

            <h4 className="text-xl">
              {user.firstName} {user.lastName}
            </h4>

            {userFromDB.bio && (
              <p>
                {userFromDB.bio.length > 256
                  ? userFromDB.bio.slice(0, 256) + "..."
                  : userFromDB.bio}
              </p>
            )}
          </div>

          <div className="">
            <Image
              src={user.imageUrl}
              alt="Image"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-x-2">
            {userId === user.id ? (
              <EditProfile userFromDB={userFromDB} userFromClerk={user} />
            ) : (
              <FollowButton
                isFollower={
                  !!followers.find(
                    (follower) => follower.follower_id === userId,
                  )
                }
                user_id={user.id}
              />
            )}
          </div>

          <div className="flex items-center gap-x-4">
            <Button variant="link" className="p-0" asChild>
              <Link href={`/${user.username}/followers`}>
                {followers.length} follower{followers.length > 1 && "s"}
              </Link>
            </Button>
            <p className="pointer-events-none select-none">·</p>
            <Button variant="link" className="p-0" asChild>
              <Link href={`/${user.username}/following`}>
                {followees.length} following
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="posts">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="w-full">
              Posts
            </TabsTrigger>
            <TabsTrigger value="replies" className="w-full" disabled>
              Replies
            </TabsTrigger>
            <TabsTrigger value="likes" className="w-full" disabled>
              Likes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="">
        {posts.length === 0 ? (
          <div>
            <div className="text-center">
              <div className="text-2xl font-semibold">No posts yet</div>
              <div className="mt-2 text-gray-500">
                When @{user.username} posts something, it will show up here.
              </div>
            </div>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <Post
                key={post.id}
                post={{
                  ...post,
                  user: {
                    ...usersFromPosts.find((user) => user.id === post.user.id)!,
                    ...post.user,
                  },
                }}
                isMyPost={userId === post.user.id}
              />
            ))}
            <LoadMoreUserPost user_id={user.id} />
          </>
        )}
      </div>
    </div>
  );
}
