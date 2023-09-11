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
import { User } from "@clerk/nextjs/server";
import { Suspense } from "react";
import PostSkeleton from "@/components/post-skeleton";

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

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="xs:flex-row flex flex-col-reverse gap-x-8">
          <div className="flex-1">
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

            <h2 className="xs:text-4xl text-2xl font-semibold">
              @{user.username}
            </h2>

            <h4 className="text-lg">
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

          <div className="min-w-max">
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
              <Suspense fallback={<Button disabled>Follow</Button>}>
                <FollowUserButton user={user} />
              </Suspense>
            )}
          </div>

          <div className="flex items-center gap-x-4">
            <Suspense
              fallback={
                <Button variant="link" className="p-0">
                  0 followers
                </Button>
              }
            >
              <FollowsButton type="followers" user={user} />
            </Suspense>
            <p className="pointer-events-none select-none">·</p>

            <Suspense
              fallback={
                <Button variant="link" className="p-0">
                  0 following
                </Button>
              }
            >
              <FollowsButton type="following" user={user} />
            </Suspense>
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
      <Suspense
        fallback={
          <>
            {[0, 1, 2, 3, 4, 5, 6].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </>
        }
      >
        <PostsWrapper user={user} />
      </Suspense>
    </div>
  );
}

async function FollowUserButton({ user }: { user: User }) {
  const { userId } = auth();
  const followers = await db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.followee_id, user.id),
  });

  return (
    <FollowButton
      isFollower={
        !!followers.find((follower) => follower.follower_id === userId)
      }
      user_id={user.id}
    />
  );
}

async function FollowsButton({
  type,
  user,
}: {
  type: "followers" | "following";
  user: User;
}) {
  if (type === "followers") {
    const followers = await db.query.followers.findMany({
      where: (follower, { eq }) => eq(follower.followee_id, user.id),
    });

    return (
      <Button variant="link" className="p-0" asChild>
        <Link href={`/${user.username}/followers`}>
          {followers.length} follower{followers.length > 1 && "s"}
        </Link>
      </Button>
    );
  }

  if (type === "following") {
    const followees = await db.query.followees.findMany({
      where: (followee, { eq }) => eq(followee.followee_id, user.id),
    });

    return (
      <Button variant="link" className="p-0" asChild>
        <Link href={`/${user.username}/following`}>
          {followees.length} following
        </Link>
      </Button>
    );
  }

  return null;
}

async function PostsWrapper({ user }: { user: User }) {
  const { userId } = auth();
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

  return (
    <div>
      {posts.length === 0 ? (
        <div className="text-center">
          <div className="text-2xl font-semibold">No posts yet</div>
          <div className="mt-2 text-gray-500">
            When @{user.username} posts something, it will show up here.
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
  );
}
