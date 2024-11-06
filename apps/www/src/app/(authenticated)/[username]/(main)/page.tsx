import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient as createClientAdmin } from "@kabsu.me/supabase/client/admin";

import DeactivatedBanned from "~/components/deactivated-banned";
import { api } from "~/lib/trpc/server";
import PageWrapper from "./page-wrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const supabaseAdmin = createClientAdmin();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select()
    .eq("username", username)
    .single();

  if (!user) notFound();

  return {
    title: `@${username}`,
  };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await api.users.getUserProfile({ username });

  if (profile.user.is_banned) return <DeactivatedBanned type="banned" />;

  if (profile.user.is_deactivated)
    return <DeactivatedBanned type="deactivated" />;

  return <PageWrapper profile={profile} username={username} />;
}
