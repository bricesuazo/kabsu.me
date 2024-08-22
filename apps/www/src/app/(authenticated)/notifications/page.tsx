"use client";

import { Bell, BookOpenCheckIcon } from "lucide-react";

import { Icons } from "~/components/icons";
import { NotificationItems } from "~/components/notifications";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/lib/trpc/client";

export default function NotificationPage() {
  const getAllNotificationsQuery = api.notifications.getAll.useQuery({
    all: true,
  });
  const markAllNotificationAsReadMutation =
    api.notifications.markAllAsRead.useMutation({
      onSettled: async () => {
        await getAllNotificationsQuery.refetch();
      },
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 pt-4">
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

      <div className="h-full min-h-full px-4">
        <NotificationItems
          getAllNotificationsQuery={getAllNotificationsQuery}
        />
      </div>
    </div>
  );
}
