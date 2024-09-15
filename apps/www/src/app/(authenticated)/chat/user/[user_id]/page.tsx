import { redirect } from "next/navigation";

import NewChat from "~/components/new-chat";
import { api } from "~/lib/trpc/server";

export default async function MessagesPage({
  params,
}: {
  params: { user_id: string };
}) {
  const room = await api.chats.getOrCreateRoom({
    user_id: params.user_id,
  });

  if (room.room_id) redirect(`/chat/${room.room_id}`);
  else if (!room.user) redirect("/chat");
  else return <NewChat user={room.user} />;
}
