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
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session) notFound();

  const data = await api.users.getAllFollowings.query({ username });

  return (
    <Following input={{ username }} output={data} user_id={session.user.id} />
  );
}
