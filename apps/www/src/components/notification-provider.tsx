"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "~/lib/trpc/client";
import { createClient } from "~/supabase/client";

export default function NotificationProvider() {
  const utils = api.useUtils();
  const getCurrentSessionQuery = api.auth.getCurrentSession.useQuery();

  useEffect(() => {
    const supabase = createClient();

    let channel: RealtimeChannel | undefined = undefined;

    if (getCurrentSessionQuery.data) {
      channel = supabase.channel(
        `notifications.${getCurrentSessionQuery.data.user.id}`,
      );
      channel
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("broadcast", { event: "unfollow" }, async () => {
          await utils.notifications.getAll.invalidate();
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .on("broadcast", { event: "follow" }, async ({ payload }) => {
          const data = z
            .object({
              type: z.string(),
              from: z.string(),
            })
            .parse(payload);

          await utils.notifications.getAll.invalidate();

          if (data.type === "follow") {
            toast(`@${data.from} started following you`, {
              description: "Check out their profile",
            });
          }
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
