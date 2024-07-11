import { redirect } from "next/navigation";

import ChatsPage from "~/components/chats-page";
import NewChat from "~/components/new-chat";
import { api } from "~/lib/trpc/server";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (typeof searchParams.user_id === "string") {
    const room = await api.chats.getOrCreateRoom.query({
      user_id: searchParams.user_id,
    });

    if (room.room_id) redirect(`/chat/${room.room_id}`);
    else if (!room.user) redirect("/chat");
    else return <NewChat user={room.user} />;
  }

  return <ChatsPage />;
}
