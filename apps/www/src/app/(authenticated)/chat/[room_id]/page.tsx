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
    const [chats, getMyUniversityStatus, getCurrentUser] = await Promise.all([
      api.chats.getGlobalChatMessages.query({
        type: room_id,
      }),
      api.auth.getMyUniversityStatus.query(),
      api.auth.getCurrentUser.query(),
    ]);
    return (
      <GlobalChatClient
        type={room_id}
        chats={chats}
        my_university_status={getMyUniversityStatus}
        current_user={getCurrentUser}
      />
    );
  }

  const [getRoom, getCurrentUser] = await Promise.all([
    api.chats.getRoom.query({ room_id }),
    api.auth.getCurrentUser.query(),
  ]);
  if (!getRoom) redirect("/chat");

  return <RoomPageClient getRoom={getRoom} current_user={getCurrentUser} />;
}
