import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient as createClientServer } from "@kabsu.me/supabase/client/server";

import { api } from "~/lib/trpc/server";
import Followers from "./followers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Followers - @${username}`,
  };
}

export default async function FollowersPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabaseServer = await createClientServer();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) notFound();

  const data = await api.users.getAllFollowers({ username });

  return <Followers input={{ username }} output={data} user_id={user.id} />;
}
