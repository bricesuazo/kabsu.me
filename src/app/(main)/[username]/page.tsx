import Post from "@/components/post";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import { auth, clerkClient } from "@clerk/nextjs";
import { isNull } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ProfileButton from "@/components/profile-button";
import Bio from "@/components/bio";

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

  const posts = await db.query.posts.findMany({
    where: (post, { and, eq }) =>
      and(isNull(post.deleted_at), eq(post.user_id, user.id)),
    orderBy: (post, { asc }) => [asc(post.created_at)],
    with: {
      user: true,
    },
  });

  const usersFromPosts = await clerkClient.users.getUserList({
    userId: posts.map((post) => post.user.id),
  });

  const program = await db.query.programs.findFirst({
    where: (program, { eq }) =>
      eq(program.id, user.publicMetadata.program_id as string),
    with: {
      department: {
        with: {
          college: true,
        },
      },
    },
  });

  const followers = await db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.followee_id, user.id),
  });

  const followees = await db.query.followees.findMany({
    where: (followee, { eq }) => eq(followee.followee_id, user.id),
  });

  return (
    <div className="space-y-8">
      <div className="flex gap-x-8">
        <div className="flex-1 ">
          {program && (
            <div className="flex items-center gap-x-2">
              <Badge>{program.department.college.slug.toUpperCase()}</Badge>
              <Badge variant="outline">
                {program.department.slug.toUpperCase()}
              </Badge>
              <Badge variant="outline">{program.slug.toUpperCase()}</Badge>
            </div>
          )}
          <h2 className="text-4xl font-semibold">
            {user.firstName} {user.lastName}
          </h2>

          <h4 className="text-xl">@{user.username}</h4>
          <Bio user={user} isSameUser={userId === user.id} />
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
          <ProfileButton
            isSameUser={userId === user.id}
            isFollower={
              !!followers.find((follower) => follower.follower_id === userId)
            }
            user_id={user.id}
          />
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

      {posts.map((post) => (
        <Post
          key={post.id}
          post={{
            ...post,
            user: usersFromPosts.find((user) => user.id === post.user.id)!,
          }}
          userId={user.id}
        />
      ))}
    </div>
  );
}
