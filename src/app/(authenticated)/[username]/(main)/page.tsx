import type { Metadata } from "next";
import { api } from "@/lib/trpc/server";
import PageWrapper from "./page-wrapper";

export function generateMetadata({
  params,
}: {
  params: { username: string };
}): Metadata {
  return {
    title: `@${params.username}`,
  };
}

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const profile = await api.users.getUserProfile.query({ username });

  return <PageWrapper profile={profile} username={username} />;
}
