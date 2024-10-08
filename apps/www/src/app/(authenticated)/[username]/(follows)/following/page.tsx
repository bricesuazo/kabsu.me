import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { api } from "~/lib/trpc/server";
import { createClient as createClientServer } from "~/supabase/server";
import Following from "./following";

export function generateMetadata({
  params: { username },
}: {
  params: { username: string };
}): Metadata {
  return {
    title: `Following - @${username}`,
  };
}

export default async function FollowingPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const supabaseServer = createClientServer();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) notFound();

  const data = await api.users.getAllFollowings({ username });

  return <Following input={{ username }} output={data} user_id={user.id} />;
}
