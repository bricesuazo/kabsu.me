import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

import PageWrapper from "./page-wrapper";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await clerkClient.users.getUserList({
    username: [params.username],
    limit: 1,
  });

  if (user.length === 0) notFound();

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
