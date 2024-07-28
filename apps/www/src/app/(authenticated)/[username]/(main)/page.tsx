import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DeactivatedBanned from "~/components/deactivated-banned";
import { api } from "~/lib/trpc/server";
import { createClient as createClientAdmin } from "~/supabase/admin";
import PageWrapper from "./page-wrapper";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const supabaseAdmin = createClientAdmin();

  const { data: user } = await supabaseAdmin
    .from("users")
    .select()
    .eq("username", params.username)
    .single();

  if (!user) notFound();

  return {
    title: `@${params.username}`,
  };
}

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const profile = await api.users.getUserProfile({ username });

  if (profile.user.is_banned) return <DeactivatedBanned type="banned" />;

  if (profile.user.is_deactivated)
    return <DeactivatedBanned type="deactivated" />;

  return <PageWrapper profile={profile} username={username} />;
}
