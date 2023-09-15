"use client";

import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "@/actions/user";
import Image from "next/image";
import moment from "moment";
import Link from "next/link";

export default function Notifications() {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getAllNotifications,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full">
          <Bell size="1rem" className="" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2" align="end">
        <h3 className="flex items-center gap-x-2 p-2 font-semibold">
          <Bell size="1rem" />
          Notifications
        </h3>
        <ScrollArea className="h-80">
          {isLoading || !data ? (
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="flex items-center gap-x-2 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center">
              <div className="text-sm text-gray-400">No notifications</div>
            </div>
          ) : (
            data.map((notification) => (
              <Link
                key={notification.id}
                href={`/${notification.link}`}
                className="flex items-center gap-x-2 p-2"
              >
                <Image
                  src={notification.from.imageUrl}
                  alt="Image"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
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
              </Link>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
