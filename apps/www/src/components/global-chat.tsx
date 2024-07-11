"use client";

import type { RouterOutput } from "@kabsu.me/api/root";

import type { Database } from "../../../../supabase/types";
import Chat from "./chat";

export default function GlobalChatClient({
  type,
  chats,
  my_university_status,
}: {
  type: Database["public"]["Enums"]["global_chat_type"];
  chats: RouterOutput["chats"]["getGlobalChatMessages"];
  my_university_status: RouterOutput["auth"]["getMyUniversityStatus"];
}) {
  return (
    <Chat
      type={type}
      messages={chats}
      my_university_status={my_university_status}
    />
  );
}
