import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { api } from "~/lib/trpc/server";
import { createClient as createClientServer } from "~/supabase/server";
import Followers from "./followers";

export function generateMetadata({
  params: { username },
}: {
  params: { username: string };
}): Metadata {
  return {
    title: `Followers - @${username}`,
  };
}

export default async function FollowersPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const supabaseServer = createClientServer();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) notFound();

  const data = await api.users.getAllFollowers({ username });

  return <Followers input={{ username }} output={data} user_id={user.id} />;
}
