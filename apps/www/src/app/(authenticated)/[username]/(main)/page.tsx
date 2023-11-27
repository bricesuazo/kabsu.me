import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";

import { db } from "@kabsu.me/db";

import PageWrapper from "./page-wrapper";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, params.username),
  });

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
  const profile = await api.users.getUserProfile.query({ username });

  return <PageWrapper profile={profile} username={username} />;
}
