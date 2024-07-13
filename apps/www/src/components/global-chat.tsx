"use client";

import type { RouterOutput } from "@kabsu.me/api/root";

import type { Database } from "../../../../supabase/types";
import { api } from "~/lib/trpc/client";
import Chat from "./chat";

export default function GlobalChatClient({
  type,
  chats,
  my_university_status,
  current_user,
}: {
  type: Database["public"]["Enums"]["global_chat_type"];
  chats: RouterOutput["chats"]["getGlobalChatMessages"];
  my_university_status: RouterOutput["auth"]["getMyUniversityStatus"];
  current_user: RouterOutput["auth"]["getCurrentUser"];
}) {
  const chatsQuery = api.chats.getGlobalChatMessages.useQuery(
    { type },
    { initialData: chats },
  );
  return (
    <Chat
      type={type}
      messages={chatsQuery.data}
      my_university_status={my_university_status}
      current_user={current_user}
    />
  );
}
