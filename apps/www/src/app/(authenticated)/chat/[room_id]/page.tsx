import { redirect } from "next/navigation";

import RoomPageClient from "~/components/room-page";
import { api } from "~/lib/trpc/server";

export default async function RoomPage({
  params: { room_id },
}: {
  params: { room_id: string };
}) {
  const getRoom = await api.chats.getRoom.query({ room_id });
  if (!getRoom) redirect("/chat");

  return <RoomPageClient getRoom={getRoom} />;
}
