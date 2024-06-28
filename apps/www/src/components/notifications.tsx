"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, BookOpenCheckIcon } from "lucide-react";

import { api } from "~/lib/trpc/client";
import { Icons } from "./icons";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function Notifications() {
  const getAllNotificationsQuery = api.notifications.getAll.useQuery({
    all: false,
  });
  const markAllNotificationAsReadMutation =
    api.notifications.markAllAsRead.useMutation({
      onSettled: async () => {
        await getAllNotificationsQuery.refetch();
      },
    });
  const markNotificationAsReadMutation =
    api.notifications.markAsRead.useMutation({
      onSettled: async () => {
        await getAllNotificationsQuery.refetch();
      },
    });

  return (
    <Popover
    // open={open} onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell size="1.25rem" className="" />

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
      <PopoverContent className="p-2" align="end">
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
          {getAllNotificationsQuery.isLoading ||
          !getAllNotificationsQuery.data ? (
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
              return (
                <Link
                  key={notification.id}
                  href={(() => {
                    if (notification.type === "follow") {
                      return `/${notification.from.username}`;
                    } else {
                      return `/${notification.from.username}/${notification.content?.id}`;
                    }
                  })()}
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationAsReadMutation.mutate({
                      id: notification.id,
                    });
                  }}
                  className="flex items-center justify-between gap-x-2 rounded p-2 hover:bg-muted"
                >
                  <div className="flex gap-x-2">
                    <Link href={`/${notification.from.username}`}>
                      <div className="relative h-8 w-8">
                        <Image
                          src={
                            notification.from.image_name
                              ? notification.from.image_url
                              : "/default-avatar.jpg"
                          }
                          alt={`${notification.from.username} profile picture`}
                          fill
                          sizes="100%"
                          className="aspect-square rounded-full object-cover object-center"
                        />
                      </div>
                    </Link>
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
                    <div className="aspect-square h-2 w-2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })
          )}
        </ScrollArea>
        <Button asChild variant="link" className="w-full" size="sm">
          <Link href="/notifications" className="text-center text-xs">
            Show all notifications
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
