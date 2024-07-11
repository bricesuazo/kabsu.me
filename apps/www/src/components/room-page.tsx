"use client";

import type { RouterOutput } from "@kabsu.me/api/root";

import { api } from "~/lib/trpc/client";
import Chat from "./chat";

export default function RoomPageClient({
  getRoom,
}: {
  getRoom: NonNullable<RouterOutput["chats"]["getRoom"]>;
}) {
  const getRoomQuery = api.chats.getRoom.useQuery(
    { room_id: getRoom.id },
    { initialData: getRoom },
  );

  return (
    <Chat
      type="room"
      to={{
        id: getRoomQuery.data?.rooms_users[0]?.users?.id ?? "",
        username: getRoomQuery.data?.rooms_users[0]?.users?.username ?? "",
      }}
      messages={getRoomQuery.data?.chats ?? []}
      room_id={getRoom.id}
    />
  );
}
