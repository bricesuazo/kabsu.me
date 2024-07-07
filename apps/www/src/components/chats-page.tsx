"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { POST_TYPE_TABS } from "@kabsu.me/constants";

import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/lib/trpc/client";
import { Skeleton } from "./ui/skeleton";

export default function ChatsPage() {
  const getAllRoomsQuery = api.chats.getAllRooms.useQuery();
  // console.log("🚀 ~ ChatsPage ~ getAllRoomsQuery:", getAllRoomsQuery);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  return (
    <>
      <Tabs
        className="p-0"
        defaultValue={searchParams.get("type") ?? ""}
        onValueChange={(value) => {
          if (value === "") {
            router.push("/chat");
          } else {
            router.push(pathname + "?" + createQueryString("type", value));
          }
        }}
      >
        <TabsList className="flex h-auto w-full justify-between rounded-none bg-transparent p-0">
          {POST_TYPE_TABS.map((select) => (
            <TabsTrigger
              key={select.id}
              className="flex w-full gap-x-2 rounded-none border-b-4 border-transparent py-4 hover:text-foreground data-[state=active]:rounded-none data-[state=active]:border-b-4 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
              value={select.id === "following" ? "" : select.id}
            >
              <div className="block sm:hidden md:block">
                <select.icon size="20" />
              </div>
              <p className="hidden sm:block">{select.name}</p>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex flex-grow flex-col">
        <div className="p-4">
          <Input placeholder="Search" className="rounded-full" />
        </div>

        <div className="flex h-0 flex-grow">
          <ScrollArea className="flex-1 px-4">
            <div className="pb-4">
              {getAllRoomsQuery.data === undefined ? (
                <div className="flex flex-col gap-y-1">
                  {Array.from({ length: 20 }).map((_, index) => (
                    <Skeleton key={index} className="h-13" />
                  ))}
                </div>
              ) : (
                getAllRoomsQuery.data.map((room) => (
                  <Link
                    key={room.id}
                    href={`/chat/${room.id}`}
                    className="flex cursor-pointer gap-2 rounded-md p-2 hover:bg-muted"
                  >
                    <div>
                      <Image
                        src="/default-avatar.jpg"
                        width={28}
                        height={28}
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
                      <p className="text-xs text-muted-foreground">
                        Test message -{" "}
                        {formatDistanceToNow(room.created_at, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
