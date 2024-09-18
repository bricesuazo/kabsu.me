"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import debounce from "lodash.debounce";
import { Book, Globe2, School, School2 } from "lucide-react";

import { Button } from "@kabsu.me/ui/button";
import { Input } from "@kabsu.me/ui/input";
import { Label } from "@kabsu.me/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@kabsu.me/ui/popover";
import { ScrollArea } from "@kabsu.me/ui/scroll-area";
import { Separator } from "@kabsu.me/ui/separator";
import { Skeleton } from "@kabsu.me/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kabsu.me/ui/tooltip";

import VerifiedBadge from "~/components/verified-badge";
import { api } from "~/lib/trpc/client";

export default function ChatsPage() {
  const searchMutation = api.users.search.useMutation();
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(
    search.length > 0 || (searchMutation.data ?? []).length > 0,
  );
  const getAllRoomsQuery = api.chats.getAllRooms.useQuery();

  const getMyUniversityStatusQuery = api.auth.getMyUniversityStatus.useQuery();

  const debounced = debounce((value: string) => {
    setSearch(value);
  }, 1000);

  useEffect(() => {
    if (search !== "") {
      searchMutation.mutate({ query: search });
    } else {
      searchMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setOpenSearch(search.length > 0 || (searchMutation.data ?? []).length > 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchMutation.data?.length]);

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
                  <div className="rounded-full bg-accent p-2 transition-colors group-hover:bg-primary group-hover:text-white">
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
        <Popover open={openSearch} onOpenChange={() => setOpenSearch(false)}>
          <PopoverTrigger asChild>
            <div>
              <Input
                placeholder="Search"
                className="rounded-full"
                onChange={(e) =>
                  e.target.value === ""
                    ? setSearch("")
                    : debounced(e.target.value)
                }
              />
            </div>
          </PopoverTrigger>
          <PopoverContent asChild>
            <ScrollArea className="flex max-h-80 flex-col gap-4">
              {searchMutation.isPending ? (
                <div className="flex flex-col gap-y-1">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : !searchMutation.data ? (
                <p className="my-4 text-center text-sm text-muted-foreground">
                  Search result will appear here
                </p>
              ) : !searchMutation.data.length ? (
                <p className="my-4 text-center text-sm">
                  {searchMutation.data.length} results found
                </p>
              ) : (
                <div className="flex flex-col gap-y-1">
                  {searchMutation.data.map((user) => (
                    <Link
                      key={user.id}
                      href={`/chat/user/${user.id}`}
                      className="flex gap-x-2 rounded p-3 hover:bg-primary-foreground"
                      onClick={() => setOpenSearch(false)}
                    >
                      <div className="min-w-max">
                        <Image
                          src={
                            user.image_name
                              ? user.image_url
                              : "/default-avatar.webp"
                          }
                          alt=""
                          width={40}
                          height={40}
                          className="aspect-square rounded-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-x-1">
                          <p className="line-clamp-1 flex-1">{user.name} </p>
                          {user.is_verified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
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
              <Button
                key={room.id}
                asChild
                variant="ghost"
                className="h-auto w-full whitespace-normal px-4 py-3"
              >
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="flex flex-1 gap-2 rounded-md"
                >
                  <Image
                    src={
                      room.rooms_users[0]?.users.image_name
                        ? room.rooms_users[0]?.users.image_url
                        : "/default-avatar.webp"
                    }
                    width={150}
                    height={150}
                    alt="Profile picture"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <p className="line-clamp-1 break-all text-sm">
                      {room.rooms_users
                        .map((user) => `@${user.users.username}`)
                        .join(", ")}
                    </p>
                    {room.chats[0] && (
                      <p className="line-clamp-1 break-all text-xs text-muted-foreground">
                        {room.chats[0].content} -{" "}
                        {formatDistanceToNow(room.chats[0].created_at, {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              </Button>
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
