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
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session) notFound();

  const data = await api.users.getAllFollowers.query({ username });

  return (
    <Followers input={{ username }} output={data} user_id={session.user.id} />
  );
}
