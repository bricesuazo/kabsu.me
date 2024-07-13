"use client";

import type { RouterOutput } from "@kabsu.me/api/root";

import { api } from "~/lib/trpc/client";
import Chat from "./chat";

export default function RoomPageClient({
  getRoom,
  current_user,
}: {
  getRoom: NonNullable<RouterOutput["chats"]["getRoom"]>;
  current_user: RouterOutput["auth"]["getCurrentUser"];
}) {
  const getRoomQuery = api.chats.getRoom.useQuery(
    { room_id: getRoom.id },
    { initialData: getRoom },
  );

  if (!getRoomQuery.data) return;

  return (
    <Chat
      type="room"
      to={getRoomQuery.data.to}
      messages={getRoomQuery.data.chats}
      room_id={getRoom.id}
      current_user={current_user}
    />
  );
}
