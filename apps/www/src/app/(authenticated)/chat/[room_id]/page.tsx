import { redirect } from "next/navigation";

import RoomPageClient from "~/components/room-page";
import { api } from "~/lib/trpc/server";

export default async function RoomPage({
  params: { room_id },
}: {
  params: { room_id: string };
}) {
  if (
    room_id === "all" ||
    room_id === "campus" ||
    room_id === "college" ||
    room_id === "program"
  ) {
    const [getRoomChats, getCurrentUser] = await Promise.all([
      api.chats.getRoomChats.query({
        type: room_id,
      }),
      api.auth.getCurrentUser.query(),
    ]);

    if (!getRoomChats) redirect("/chat");

    return (
      <RoomPageClient
        type={room_id}
        getRoomChats={getRoomChats}
        current_user={getCurrentUser}
      />
    );
  } else {
    const [getRoomChats, getCurrentUser] = await Promise.all([
      api.chats.getRoomChats.query({ type: "room", room_id }),
      api.auth.getCurrentUser.query(),
    ]);

    if (!getRoomChats) redirect("/chat");

    return (
      <RoomPageClient
        type="room"
        getRoomChats={getRoomChats}
        current_user={getCurrentUser}
      />
    );
  }
}
