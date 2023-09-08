import Post from "@/components/post";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import { auth, clerkClient } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FollowButton from "@/components/follow-button";
import type { Metadata } from "next";
import { Album, Briefcase, GraduationCap } from "lucide-react";
import EditProfile from "@/components/edit-profile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    where: (user, { eq }) => eq(user.id, user.id),

    with: {
      program: { with: { college: true } },
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
          program: { with: { college: true } },
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
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex gap-x-8">
          <div className="flex-1 ">
            <div className="flex items-center gap-x-2">
              <Tooltip delayDuration={0}>
                {(() => {
                  switch (userFromDB.type) {
                    case "student":
                      return (
                        <>
                          <TooltipTrigger asChild>
                            <Album />
                          </TooltipTrigger>
                          <TooltipContent>Student</TooltipContent>
                        </>
                      );
                    case "alumni":
                      return (
                        <>
                          <TooltipTrigger asChild>
                            <GraduationCap />
                          </TooltipTrigger>
                          <TooltipContent>Alumni</TooltipContent>
                        </>
                      );
                    case "faculty":
                      return (
                        <>
                          <TooltipTrigger asChild>
                            <Briefcase />
                          </TooltipTrigger>
                          <TooltipContent>Faculty</TooltipContent>
                        </>
                      );
                    default:
                      return null;
                  }
                })()}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge>{userFromDB.program.college.slug.toUpperCase()}</Badge>
                </TooltipTrigger>
                <TooltipContent className="w-60">
                  {userFromDB.program.college.name}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">
                    {userFromDB.program.slug.toUpperCase()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="w-60">
                  {userFromDB.program.name}
                </TooltipContent>
              </Tooltip>
            </div>

            <h2 className="text-4xl font-semibold">@{user.username}</h2>

            <h4 className="text-xl">
              {user.firstName} {user.lastName}
            </h4>

            <p>{userFromDB.bio ?? "No bio yet"}</p>
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

        <Tabs
          defaultValue="posts"
          // onChange={(values) => console.log(values)}
        >
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="w-full">
              Posts
            </TabsTrigger>
            <TabsTrigger value="replies" className="w-full">
              Replies
            </TabsTrigger>
            <TabsTrigger value="likes" className="w-full">
              Likes
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="">
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
        </div>
      </div>
    </TooltipProvider>
  );
}
