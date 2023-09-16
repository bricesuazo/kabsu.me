"use client";

import {
  getAllNotifications,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from "@/actions/user";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, BookOpenCheckIcon } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";

export default function NotificationPage() {
  const getAllNotificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getAllNotifications,
    refetchOnMount: false,
    // refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
  const markAllNotificationAsReadMutation = useMutation({
    mutationFn: markAllNotificationAsRead,
    onSettled: () => {
      getAllNotificationsQuery.refetch();
    },
  });
  const markNotificationAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSettled: () => {
      getAllNotificationsQuery.refetch();
    },
  });
  return (
    <>
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
                markAllNotificationAsReadMutation.isLoading ||
                getAllNotificationsQuery.isLoading ||
                !getAllNotificationsQuery.data ||
                getAllNotificationsQuery.data.length === 0 ||
                getAllNotificationsQuery.data.filter(
                  (notification) => !notification.read,
                ).length === 0
              }
            >
              {markAllNotificationAsReadMutation.isLoading ? (
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
          [...Array(10)].map((i) => (
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
          getAllNotificationsQuery.data.map((notification) => (
            <Link
              key={notification.id}
              href={(() => {
                switch (notification.type) {
                  case "follow":
                    return `/${notification.from.username}`;
                  case "like":
                    return `/${notification.from.username}/${notification.link}`;
                  case "comment":
                    return `/${notification.from.username}//${notification.link}`;
                  default:
                    return "";
                }
              })()}
              onClick={() =>
                markNotificationAsReadMutation.mutate({ id: notification.id })
              }
              className="flex items-center gap-x-2 rounded p-2 hover:bg-muted"
            >
              <Link href={`/${notification.from.username}`}>
                <div className="relative h-10 w-10">
                  <Image
                    src={notification.from.imageUrl}
                    alt="Image"
                    fill
                    sizes="100%"
                    className="rounded-full"
                  />
                </div>
              </Link>
              <div className="flex flex-col gap-1">
                <p className="line-clamp-2 text-sm font-medium">
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
                  {moment(notification.created_at).fromNow()}
                </p>
              </div>
              {!notification.read && (
                <div className="aspect-square h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>
          ))
        )}
      </ScrollArea>
    </>
  );
}
