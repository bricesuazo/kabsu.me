import { redirect } from "next/navigation";

import GlobalChatClient from "~/components/global-chat";
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
    const [chats, getMyUniversityStatus] = await Promise.all([
      api.chats.getGlobalChatMessages.query({
        type: room_id,
      }),
      api.auth.getMyUniversityStatus.query(),
    ]);
    return (
      <GlobalChatClient
        type={room_id}
        chats={chats}
        my_university_status={getMyUniversityStatus}
      />
    );
  }

  const getRoom = await api.chats.getRoom.query({ room_id });
  if (!getRoom) redirect("/chat");

  return <RoomPageClient getRoom={getRoom} />;
}
