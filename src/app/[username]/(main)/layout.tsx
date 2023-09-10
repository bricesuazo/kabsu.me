import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import FollowButton from "@/components/follow-button";
import { Album, Briefcase, GraduationCap } from "lucide-react";
import EditProfile from "@/components/edit-profile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { auth, clerkClient } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import { db } from "@/db";

export default async function ProfileLayout({
  params: { username },
  children,
}: React.PropsWithChildren<{
  params: { username: string };
}>) {
  const { userId } = auth();

  const usersFromClerk = await clerkClient.users.getUserList({
    username: [username],
  });

  const userFromClerk = usersFromClerk[0];

  if (!userFromClerk) notFound();

  const userFromDB = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, userFromClerk.id),

    with: {
      program: { with: { college: { with: { campus: true } } } },
    },
  });

  if (!userFromDB) notFound();

  const followers = await db.query.followers.findMany({
    where: (follower, { eq }) => eq(follower.followee_id, userFromClerk.id),
  });

  const followees = await db.query.followees.findMany({
    where: (followee, { eq }) => eq(followee.followee_id, userFromClerk.id),
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

            <h2 className="text-4xl font-semibold">
              @{userFromClerk.username}
            </h2>

            <h4 className="text-xl">
              {userFromClerk.firstName} {userFromClerk.lastName}
            </h4>

            <p>
              {userFromDB.bio && userFromDB.bio.length > 256
                ? userFromDB.bio.slice(0, 256) + "..."
                : userFromDB.bio}
            </p>
          </div>
          <div className="">
            <Image
              src={userFromClerk.imageUrl}
              alt="Image"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-x-2">
            {userId === userFromClerk.id ? (
              <EditProfile
                userFromDB={userFromDB}
                userFromClerk={userFromClerk}
              />
            ) : (
              <FollowButton
                isFollower={
                  !!followers.find(
                    (follower) => follower.follower_id === userId,
                  )
                }
                user_id={userFromClerk.id}
              />
            )}
          </div>

          <div className="flex items-center gap-x-4">
            <Button variant="link" className="p-0" asChild>
              <Link href={`/${userFromClerk.username}/followers`}>
                {followers.length} follower{followers.length > 1 && "s"}
              </Link>
            </Button>
            <p className="pointer-events-none select-none">·</p>
            <Button variant="link" className="p-0" asChild>
              <Link href={`/${userFromClerk.username}/following`}>
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

      {children}
    </div>
  );
}
