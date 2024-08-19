"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "~/lib/trpc/client";
import { createClient } from "~/supabase/client";

export default function NotificationProvider() {
  const router = useRouter();
  const utils = api.useUtils();
  const getCurrentSessionQuery = api.auth.getCurrentSession.useQuery();
  const markAsReadMutation = api.notifications.markAsRead.useMutation({
    onSuccess: () => utils.notifications.getAll.invalidate(),
  });

  useEffect(() => {
    const supabase = createClient();

    let channel: RealtimeChannel | undefined = undefined;

    if (getCurrentSessionQuery.data) {
      channel = supabase.channel(
        `notifications.${getCurrentSessionQuery.data.user.id}`,
      );
      channel
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("broadcast", { event: "follow" }, async ({ payload }) => {
          const data = z
            .object({ notification_id: z.string(), from: z.string() })
            .parse(payload);

          await utils.notifications.getAll.invalidate();

          toast(`@${data.from} started following you!`, {
            description: "Click to visit their profile",
            action: {
              label: "Visit",
              onClick: () => {
                router.push(`/${data.from}`);
                markAsReadMutation.mutate({ id: data.notification_id });
              },
            },
          });
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("broadcast", { event: "like_post" }, async ({ payload }) => {
          const data = z
            .object({
              notification_id: z.string(),
              from: z.string(),
              to: z.string(),
              post_id: z.string(),
            })
            .parse(payload);

          await Promise.all([
            utils.notifications.getAll.invalidate(),
            utils.posts.getPost.invalidate({
              post_id: data.post_id,
              username: data.to,
            }),
          ]);

          toast(`@${data.from} liked your post!`, {
            description: "Click to view the post",
            action: {
              label: "Visit",
              onClick: () => {
                router.push(`/${data.to}/${data.post_id}`);
                markAsReadMutation.mutate({ id: data.notification_id });
              },
            },
          });
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("broadcast", { event: "unfollow" }, () =>
          utils.notifications.getAll.invalidate(),
        )
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("broadcast", { event: "comment" }, async ({ payload }) => {
          const data = z
            .object({
              notification_id: z.string(),
              from: z.string(),
              to: z.string(),
              post_id: z.string(),
            })
            .parse(payload);

          await Promise.all([
            utils.notifications.getAll.invalidate(),
            utils.posts.getPost.invalidate({
              post_id: data.post_id,
              username: data.to,
            }),
          ]);

          toast(`@${data.from} commented on your post!`, {
            description: "Click to view the comment",
            action: {
              label: "Visit",
              onClick: () => {
                router.push(`/${data.to}/${data.post_id}`);
                markAsReadMutation.mutate({ id: data.notification_id });
              },
            },
          });
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("broadcast", { event: "reply" }, async ({ payload }) => {
          const data = z
            .object({
              notification_id: z.string(),
              from: z.string(),
              to: z.string(),
              post_id: z.string(),
              comment_id: z.string(),
            })
            .parse(payload);

          await Promise.all([
            utils.notifications.getAll.invalidate(),
            utils.comments.getFullComment.invalidate({
              comment_id: data.comment_id,
            }),
          ]);

          toast(`@${data.from} replied on your comment!`, {
            description: "Click to view the reply",
            action: {
              label: "Visit",
              onClick: () => {
                router.push(`/${data.to}/${data.post_id}`);
                markAsReadMutation.mutate({ id: data.notification_id });
              },
            },
          });
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("broadcast", { event: "mention_post" }, async ({ payload }) => {
          const data = z
            .object({
              notification_id: z.string(),
              from: z.string(),
              post_id: z.string(),
            })
            .parse(payload);

          await utils.notifications.getAll.invalidate();

          toast(`@${data.from} mentioned you in a post!`, {
            description: "Click to view the post",
            action: {
              label: "Visit",
              onClick: () => {
                router.push(`/${data.from}/${data.post_id}`);
                markAsReadMutation.mutate({ id: data.notification_id });
              },
            },
          });
        })
        .on("broadcast", { event: "message_new" }, ({ payload }) => {
          const data = z
            .object({
              room_id: z.string(),
              from_username: z.string(),
            })
            .parse(payload);

          toast(`@${data.from_username} messaged you!`, {
            description: "Click to view the message",
            action: {
              label: "View",
              onClick: () => router.push(`/chat/${data.room_id}`),
            },
          });
        })
        .subscribe();
    }

    return () => {
      void channel?.unsubscribe();
      if (channel) void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCurrentSessionQuery.data]);

  return null;
}
