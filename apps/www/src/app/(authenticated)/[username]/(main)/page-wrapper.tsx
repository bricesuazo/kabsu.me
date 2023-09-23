"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EditProfile from "@/components/edit-profile";
import FollowButton from "@/components/follow-button";
import { Icons } from "@/components/icons";
import PostForm from "@/components/post-form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import VerifiedBadge from "@/components/verified-badge";
import { api } from "@/lib/trpc/client";
import { getOrdinal } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogPortal } from "@radix-ui/react-dialog";
import { Album, Briefcase, Flag, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { RouterOutput } from "@cvsu.me/api/root";

import PostsWrapper from "./posts-wrapper";

export default function UserPageWrapper({
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
  const [openReport, setOpenReport] = useState(false);

  const reportForm = useForm<{
    reason: string;
  }>({
    resolver: zodResolver(
      z.object({
        reason: z.string().nonempty("Please provide a reason for your report."),
      }),
    ),
    defaultValues: {
      reason: "",
    },
  });

  const reportUserMutation = api.users.report.useMutation({
    onSuccess: () => {
      setOpenReport(false);
      toast({
        title: "User reported",
        description: "Your report has been submitted",
      });
    },
  });

  useEffect(() => {
    if (openReport) reportForm.reset();
  }, [openReport]);

  return (
    <div className="relative min-h-screen space-y-4 border-b">
      <div>
        <div className="flex w-full flex-row-reverse gap-x-2 gap-y-4 p-4 xs:flex-row">
          <div className="w-px flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
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
                <TooltipTrigger className="">
                  <Badge variant="outline">
                    {profileQuery.data.user.program.slug.toUpperCase()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-60">
                  {profileQuery.data.user.program.name}
                </TooltipContent>
              </Tooltip>

              <div>
                <Badge variant="outline">
                  {getOrdinal(profileQuery.data.user.user_number + 1)} user
                </Badge>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-x-2">
                <h2 className="truncate text-2xl font-semibold xs:text-4xl">
                  {profileQuery.data.user.firstName}{" "}
                  {profileQuery.data.user.lastName}
                </h2>

                {profileQuery.data.user.verified_at && (
                  <VerifiedBadge size="lg" />
                )}
              </div>

              <p className="line-clamp-1  ">
                @{profileQuery.data.user.username}
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

          <Dialog>
            <DialogTrigger asChild className="hover:cursor-pointer">
              <div className="relative aspect-square h-20 min-w-max overflow-clip rounded-full xs:h-32">
                <div className="absolute bottom-0 flex w-full justify-center bg-gradient-to-t from-black to-transparent p-2">
                  <Tooltip delayDuration={250}>
                    {(() => {
                      if (profileQuery.data.user.type === "student") {
                        return (
                          <>
                            <TooltipTrigger>
                              <Album className="h-5 w-5 text-white xs:h-8 xs:w-8" />
                            </TooltipTrigger>
                            <TooltipContent className="z-50">
                              Student
                            </TooltipContent>
                          </>
                        );
                      } else if (profileQuery.data.user.type === "alumni") {
                        return (
                          <>
                            <TooltipTrigger>
                              <GraduationCap className="h-5 w-5 text-white xs:h-8 xs:w-8" />
                            </TooltipTrigger>
                            <TooltipContent className="z-50">
                              Alumni
                            </TooltipContent>
                          </>
                        );
                      } else if (profileQuery.data.user.type === "faculty") {
                        return (
                          <>
                            <TooltipTrigger>
                              <Briefcase className="h-5 w-5 text-white xs:h-8 xs:w-8" />
                            </TooltipTrigger>
                            <TooltipContent className="z-50">
                              Faculty
                            </TooltipContent>
                          </>
                        );
                      }
                    })()}
                  </Tooltip>
                </div>

                <Image
                  src={profileQuery.data.user.imageUrl}
                  alt={`${profileQuery.data.user.firstName} ${profileQuery.data.user.lastName} profile picture`}
                  fill
                  sizes="100%"
                  className="-z-10 object-cover"
                />
              </div>
            </DialogTrigger>

            <DialogContent className="border-transparent bg-transparent">
              <div className="p-4">
                <Image
                  src={profileQuery.data.user.imageUrl}
                  alt={`${profileQuery.data.user.firstName} ${profileQuery.data.user.lastName} profile picture`}
                  width={500}
                  height={500}
                  sizes="100%"
                  className="rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col items-start gap-x-4 gap-y-2 border-b px-4 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-x-2">
            {profileQuery.data.isFollower !== undefined ? (
              <div className="flex items-center gap-x-2">
                <FollowButton
                  isFollower={profileQuery.data.isFollower}
                  user_id={profileQuery.data.user.id}
                />
                <AlertDialog open={openReport} onOpenChange={setOpenReport}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <Form {...reportForm}>
                      <form
                        onSubmit={reportForm.handleSubmit((values) => {
                          reportUserMutation.mutate({
                            user_id: profileQuery.data.user.id,
                            reason: values.reason,
                          });
                        })}
                        className="space-y-4"
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle>Report User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Report this user to the administrators.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <FormField
                          control={reportForm.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason</FormLabel>

                              <FormControl>
                                <Textarea
                                  placeholder="Please provide a reason for your report."
                                  {...field}
                                />
                              </FormControl>

                              <FormDescription>
                                Please provide a reason for your report.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <AlertDialogFooter>
                          <AlertDialogCancel
                            disabled={reportUserMutation.isLoading}
                          >
                            Cancel
                          </AlertDialogCancel>

                          <Button
                            variant="destructive"
                            type="submit"
                            disabled={reportUserMutation.isLoading}
                          >
                            {reportUserMutation.isLoading && (
                              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Report
                          </Button>
                        </AlertDialogFooter>
                      </form>
                    </Form>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
