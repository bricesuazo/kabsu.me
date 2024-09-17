"use client";

import type { TRPCClientErrorLike } from "@trpc/client";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell, BookOpenCheckIcon, VenetianMask } from "lucide-react";

import type { AppRouter } from "@kabsu.me/api";
import { Button } from "@kabsu.me/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@kabsu.me/ui/popover";
import { ScrollArea } from "@kabsu.me/ui/scroll-area";
import { Skeleton } from "@kabsu.me/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kabsu.me/ui/tooltip";

import type { RouterOutputs } from "~/lib/trpc/client";
import { api } from "~/lib/trpc/client";
import { Icons } from "./icons";

export default function Notifications() {
  const [open, setOpen] = useState(false);

  const getAllNotificationsQuery = api.notifications.getAll.useQuery({
    all: false,
  });

  const markAllNotificationAsReadMutation =
    api.notifications.markAllAsRead.useMutation({
      onSettled: () => getAllNotificationsQuery.refetch(),
    });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Bell className="size-5" />

              {getAllNotificationsQuery.data &&
              getAllNotificationsQuery.data.filter(
                (notification) => !notification.read,
              ).length > 0 ? (
                <p className="absolute right-0 top-0 flex aspect-square h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.5rem] text-white">
                  {
                    getAllNotificationsQuery.data.filter(
                      (notification) => !notification.read,
                    ).length
                  }
                </p>
              ) : null}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
      <PopoverContent className="p-2">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-x-2 p-2 font-semibold">
            <Bell size="1rem" />
            Notifications
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => markAllNotificationAsReadMutation.mutate()}
                disabled={
                  markAllNotificationAsReadMutation.isPending ||
                  getAllNotificationsQuery.isLoading ||
                  !getAllNotificationsQuery.data ||
                  getAllNotificationsQuery.data.length === 0 ||
                  getAllNotificationsQuery.data.filter(
                    (notification) => !notification.read,
                  ).length === 0
                }
              >
                {markAllNotificationAsReadMutation.isPending ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  <BookOpenCheckIcon size="1rem" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Mark all as read</TooltipContent>
          </Tooltip>
        </div>

        <ScrollArea className="h-80">
          <NotificationItems
            getAllNotificationsQuery={getAllNotificationsQuery}
            setOpen={setOpen}
          />
        </ScrollArea>

        <Button asChild variant="link" className="w-full" size="sm">
          <Link
            href="/notifications"
            className="text-center text-xs"
            onClick={() => setOpen(false)}
          >
            Show all notifications
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function NotificationItems({
  getAllNotificationsQuery,
  setOpen,
}: {
  getAllNotificationsQuery: UseTRPCQueryResult<
    RouterOutputs["notifications"]["getAll"],
    TRPCClientErrorLike<AppRouter>
  >;
  setOpen?: (open: boolean) => void;
}) {
  const utils = api.useUtils();
  const router = useRouter();
  const markNotificationAsReadMutation =
    api.notifications.markAsRead.useMutation({
      onSettled: () => utils.notifications.getAll.invalidate(),
    });
  return (
    <div className="flex flex-col">
      {getAllNotificationsQuery.isLoading || !getAllNotificationsQuery.data ? (
        [...(Array(10) as number[])].map((_, i) => (
          <div key={i} className="flex items-center gap-x-2 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))
      ) : getAllNotificationsQuery.data.length === 0 ? (
        <div className="flex items-center justify-center">
          <div className="text-sm text-gray-400">No notifications</div>
        </div>
      ) : (
        getAllNotificationsQuery.data.map((notification) => {
          if (
            notification.type === "strike_account" ||
            notification.type === "strike_post"
          )
            return (
              <Link
                key={notification.id}
                href="/account"
                onClick={() => {
                  if (notification.read) return;
                  markNotificationAsReadMutation.mutate({
                    id: notification.id,
                  });

                  if (setOpen) setOpen(false);
                }}
                className="flex items-center justify-between gap-x-2 rounded p-2 hover:bg-muted"
              >
                <div className="flex gap-x-2">
                  <div>
                    <Image
                      src="/logo.svg"
                      alt="System"
                      width={28}
                      height={28}
                      className="aspect-square object-contain object-center"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="line-clamp-2 text-xs font-medium">
                      {(() => {
                        switch (notification.type) {
                          case "strike_account":
                            return "Your account has been striked";
                          case "strike_post":
                            return "Your post has been striked";
                          default:
                            return "";
                        }
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.created_at, {
                        includeSeconds: true,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <div className="aspect-square size-2 rounded-full bg-primary" />
                )}
              </Link>
            );

          if (notification.type === "ngl")
            return (
              <button
                key={notification.id}
                onClick={() => {
                  if (!notification.read)
                    markNotificationAsReadMutation.mutate({
                      id: notification.id,
                    });

                  router.push(
                    `/ngl?question_id=${notification.ngl_question_id}`,
                  );
                  if (setOpen) setOpen(false);
                }}
                className="flex items-center justify-between gap-x-2 rounded p-2 text-start hover:bg-muted"
              >
                <div className="flex gap-x-2">
                  <div>
                    <div className="grid size-7 place-items-center rounded-full bg-muted">
                      <VenetianMask className="size-5" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="line-clamp-2 text-xs font-medium">
                      You have received a new anonymous message
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.created_at, {
                        includeSeconds: true,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  {!notification.read && (
                    <div className="aspect-square size-2 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            );
          return (
            <Link
              key={notification.id}
              href={(() => {
                if (notification.type === "follow") {
                  return `/${notification.from.username}`;
                } else {
                  return `/${notification.content?.user?.username}/${notification.content_id}`;
                }
              })()}
              onClick={(e) => {
                e.stopPropagation();
                if (notification.read) return;

                markNotificationAsReadMutation.mutate({
                  id: notification.id,
                });
                if (setOpen) setOpen(false);
              }}
              className="flex items-center gap-x-2 rounded p-2 hover:bg-muted"
            >
              <div className="flex flex-1 gap-x-2">
                <div>
                  <div className="size-7">
                    <Image
                      src={
                        notification.from.image_name
                          ? notification.from.image_url
                          : "/default-avatar.jpg"
                      }
                      alt={`${notification.from.username} profile picture`}
                      width={28}
                      height={28}
                      className="aspect-square rounded-full object-cover object-center"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="line-clamp-2 text-xs font-medium">
                    @{notification.from.username}{" "}
                    {(() => {
                      switch (notification.type) {
                        case "follow":
                          return "started following you";
                        case "like":
                          return "liked your post";
                        case "comment":
                          return "commented on your post";
                        case "mention_comment":
                          return "mentioned you in a comment";
                        case "mention_post":
                          return "mentioned you in a post";
                        case "reply":
                          return "replied to your comment";
                        default:
                          return "";
                      }
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.created_at, {
                      includeSeconds: true,
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {!notification.read && (
                <div className="aspect-square size-2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })
      )}
    </div>
  );
}
