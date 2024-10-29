import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient as createClientServer } from "@kabsu.me/supabase/client/server";

import { api } from "~/lib/trpc/server";
import Following from "./following";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Following - @${username}`,
  };
}

export default async function FollowingPage({
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

  const data = await api.users.getAllFollowings({ username });

  return <Following input={{ username }} output={data} user_id={user.id} />;
}
