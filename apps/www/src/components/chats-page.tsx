"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Book, Globe2, School, School2 } from "lucide-react";

import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/lib/trpc/client";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function ChatsPage() {
  const getAllRoomsQuery = api.chats.getAllRooms.useQuery();
  const getMyUniversityStatusQuery = api.auth.getMyUniversityStatus.useQuery();

  return (
    <div className="flex flex-grow flex-col">
      <div className="flex flex-col gap-2 p-4">
        <Label className="text-center">Global Chats</Label>
        <div className="grid grid-cols-2 xs:grid-cols-4">
          {[
            {
              id: "all",
              label: "All Campuses",
              sublabel: "Global",
              Icon: Globe2,
              tooltip: "Global chatrooms",
            },
            {
              id: "campus",
              label: "My Campus",
              sublabel:
                getMyUniversityStatusQuery.data?.programs?.colleges?.campuses
                  ?.slug,
              Icon: School2,
              tooltip:
                getMyUniversityStatusQuery.data?.programs?.colleges?.campuses
                  ?.name,
            },
            {
              id: "college",
              label: "My College",
              sublabel:
                getMyUniversityStatusQuery.data?.programs?.colleges?.slug,
              Icon: School,
              tooltip:
                getMyUniversityStatusQuery.data?.programs?.colleges?.name,
            },
            {
              id: "program",
              label: "My Program",
              sublabel: getMyUniversityStatusQuery.data?.programs?.slug,
              Icon: Book,
              tooltip: getMyUniversityStatusQuery.data?.programs?.name,
            },
          ].map((type) => (
            <Tooltip key={type.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={`/chat/${type.id}`}
                  className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md px-2 py-4 hover:bg-muted"
                >
                  <div className="rounded-full bg-accent p-2 transition-colors group-hover:bg-primary">
                    <type.Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-center text-sm">{type.label}</p>
                    {type.sublabel === undefined ? (
                      <Skeleton className="mx-auto my-0.5 h-3 w-14" />
                    ) : (
                      <p className="text-center text-xs text-muted-foreground">
                        {type.sublabel.toUpperCase()}
                      </p>
                    )}
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-60">
                {type.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <Separator />

      <div className="p-4">
        <Input placeholder="Search" className="rounded-full" />
      </div>

      <div className="flex h-0 flex-grow">
        <ScrollArea className="flex-1 px-4">
          {getAllRoomsQuery.data === undefined ? (
            <div className="space-y-2">
              {Array.from({ length: 20 }).map((_, index) => (
                <Skeleton key={index} className="h-14" />
              ))}
            </div>
          ) : getAllRoomsQuery.data.length === 0 ? (
            <div className="grid flex-1 place-items-center">
              <p className="text-muted-foreground">No chats yet.</p>
            </div>
          ) : (
            getAllRoomsQuery.data.map((room) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex cursor-pointer gap-2 rounded-md px-4 py-3 hover:bg-muted"
              >
                <div>
                  <Image
                    src="/default-avatar.jpg"
                    width={36}
                    height={36}
                    alt="Profile picture"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="text-sm">
                    {room.rooms_users
                      .map((user) => `@${user.users?.username}`)
                      .join(", ")}
                  </p>
                  {room.chats[0] && (
                    <p className="text-xs text-muted-foreground">
                      {room.chats[0].content} -{" "}
                      {formatDistanceToNow(room.chats[0].created_at, {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
