"use client";

import { Album, Briefcase, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import EditProfile from "@/components/edit-profile";
import { Button } from "@/components/ui/button";
import { getOrdinal } from "@/lib/utils";
import PostsWrapper from "./posts-wrapper";
import { api } from "@/lib/trpc/client";
import { RouterOutput } from "@/lib/server/routers/_app";
import FollowButton from "@/components/follow-button";
import Link from "next/link";
import PostForm from "@/components/post-form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UserPage({
  profile,
  username,
}: {
  profile: RouterOutput["users"]["getUserProfile"];
  username: string;
}) {
  const profileQuery = api.users.getUserProfile.useQuery(
    { username },
    { initialData: profile, refetchOnWindowFocus: false },
  );

  const formatedLink = profileQuery.data.user.link?.split("https://")[1] ?? "";

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex w-full flex-col-reverse gap-x-8 gap-y-4 xs:flex-row">
          <div className="flex-1 space-y-2 xs:w-px">
            <div className="flex items-center gap-x-2">
              <Tooltip delayDuration={250}>
                {(() => {
                  if (profileQuery.data.user.type === "student") {
                    return (
                      <>
                        <TooltipTrigger>
                          <Album />
                        </TooltipTrigger>
                        <TooltipContent>Student</TooltipContent>
                      </>
                    );
                  } else if (profileQuery.data.user.type === "alumni") {
                    return (
                      <>
                        <TooltipTrigger>
                          <GraduationCap />
                        </TooltipTrigger>
                        <TooltipContent>Alumni</TooltipContent>
                      </>
                    );
                  } else if (profileQuery.data.user.type === "faculty") {
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
                    {profileQuery.data.user.program.college.campus.slug.toUpperCase()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-60">
                  {profileQuery.data.user.program.college.campus.name}
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={250}>
                <TooltipTrigger>
                  <Badge variant="outline">
                    {profileQuery.data.user.program.slug.toUpperCase()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-60">
                  {profileQuery.data.user.program.name}
                </TooltipContent>
              </Tooltip>

              <Badge variant="outline">
                {getOrdinal(profileQuery.data.user.user_number + 1)} user
              </Badge>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-x-2">
                <h2 className="truncate  text-2xl font-semibold xs:text-4xl">
                  @{profileQuery.data.user.username}
                </h2>

                {profileQuery.data.user.verified_at && (
                  <Tooltip delayDuration={250}>
                    <TooltipTrigger>
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        width={32}
                        height={32}
                      />
                    </TooltipTrigger>
                    <TooltipContent>CvSU.me Verified</TooltipContent>
                  </Tooltip>
                )}
              </div>

              <p className="line-clamp-1  ">
                {profileQuery.data.user.firstName}{" "}
                {profileQuery.data.user.lastName}
              </p>

              <p className="break-words text-muted-foreground">
                {profileQuery.data.user.bio ??
                  "This user hasn't written a bio yet."}
              </p>

              <div className="">
                {profileQuery.data.user.link && (
                  <Button asChild variant="link" className="h-auto p-0">
                    <Link href={profileQuery.data.user.link} target="_blank">
                      {formatedLink.length > 30
                        ? formatedLink.slice(0, 30) + "..."
                        : formatedLink}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="min-w-max">
            <Image
              src={profileQuery.data.user.imageUrl}
              alt="Image"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-x-2">
            {profileQuery.data.isFollower !== undefined ? (
              <FollowButton
                isFollower={profileQuery.data.isFollower}
                user_id={profileQuery.data.user.id}
              />
            ) : (
              <EditProfile
                userFromDB={profileQuery.data.user}
                userFromClerk={profileQuery.data.user}
                data-superjson
              />
            )}
          </div>

          <div className="flex items-center gap-x-4">
            <Button variant="link" className="p-0" asChild>
              <Link href={`/${profileQuery.data.user.username}/followers`}>
                {profileQuery.data.followersLength} follower
                {profileQuery.data.followersLength > 1 && "s"}
              </Link>
            </Button>

            <p className="pointer-events-none select-none">·</p>

            <Button variant="link" className="p-0" asChild>
              <Link href={`/${profileQuery.data.user.username}/following`}>
                {profileQuery.data.followeesLength} following
              </Link>
            </Button>
          </div>
        </div>
        {/* <Tabs defaultValue="posts">
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
          </Tabs> */}
        {profileQuery.data.user.id === profileQuery.data.userId && <PostForm />}
      </div>

      <PostsWrapper user={profileQuery.data.user} data-superjson />
    </div>
  );
}
