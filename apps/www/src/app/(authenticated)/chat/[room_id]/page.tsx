import RoomPageClient from "~/components/room-page";
import { api } from "~/lib/trpc/server";

export default async function RoomPage({
  params: { room_id },
}: {
  params: { room_id: string };
}) {
  const getRoom = await api.chats.getRoom.query({ room_id });
  return <RoomPageClient getRoom={getRoom} />;
}
