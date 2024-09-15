import { EllipsisVertical, Send } from "lucide-react";

import { cn } from "@kabsu.me/ui";
import { Button } from "@kabsu.me/ui/button";
import { Input } from "@kabsu.me/ui/input";
import { ScrollArea } from "@kabsu.me/ui/scroll-area";
import { Separator } from "@kabsu.me/ui/separator";
import { Skeleton } from "@kabsu.me/ui/skeleton";

export default function ChatSkeleton() {
  return (
    <div className="flex flex-grow flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <div className="flex items-center gap-1">
              <Skeleton className="size-2" />
              <Skeleton className="h-2 w-10" />
            </div>
          </div>
        </div>

        <div className="grid size-10 place-items-center">
          <EllipsisVertical size="1rem" className="animate-pulse" />
        </div>
      </div>

      <Separator />

      <div className="flex h-0 flex-grow">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {[
              { is_me: true },
              { is_me: false },
              { is_me: true },
              { is_me: true },
              { is_me: false },
              { is_me: true },
              { is_me: false },
              { is_me: false },
              { is_me: false },
              { is_me: true },
              { is_me: false },
              { is_me: false },
              { is_me: true },
              { is_me: true },
              { is_me: false },
              { is_me: true },
            ].map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-end gap-2",
                  message.is_me && "flex-row-reverse",
                )}
              >
                <div>
                  <Skeleton className="size-7 rounded-full" />
                </div>

                <div
                  className={cn(
                    "flex items-center gap-2",
                    message.is_me && "flex-row-reverse",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-60 rounded-md bg-muted px-3 py-2 xs:max-w-72 sm:max-w-96",
                      message.is_me ? "rounded-br-none" : "rounded-bl-none",
                    )}
                  >
                    <Skeleton className="my-1 h-4 w-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="flex items-center gap-2 p-4">
        <Input placeholder="Write a message..." disabled className="flex-1" />
        <Button type="submit" size="icon" variant="outline" disabled>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
