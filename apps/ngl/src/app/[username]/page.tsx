import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { env } from "~/env";
import { api } from "~/lib/trpc/server";
import UserPageClient from "./_components/client";

export async function generateMetadata({
  params: { username },
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await api.ngl.getUser({ username });

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  const getImageUrl = () => {
    const share_image_url = new URL("/api/user-og", env.NEXT_PUBLIC_NGL_URL);
    share_image_url.searchParams.append("username", user.username);

    return share_image_url.toString();
  };

  return {
    title: `${user.username}'s NGL`,
    description: `Send anonymous messages to ${user.username} on NGL`,
    openGraph: {
      title: `${user.username}'s NGL`,
      description: `Send anonymous messages to ${user.username} on NGL`,
      images: [
        {
          url: getImageUrl(),
          width: 1200,
          height: 675,
          alt: `${user.username} NGL`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.username}'s NGL`,
      description: `Send anonymous messages to ${user.username} on NGL`,
      images: [
        {
          url: getImageUrl(),
          width: 1200,
          height: 675,
          alt: `${user.username} NGL`,
        },
      ],
    },
  };
}

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const [user, getTotalUsersQuery, session] = await Promise.all([
    api.ngl.getUser({ username }),
    api.users.getTotalUsers(),
    api.auth.getCurrentSession(),
  ]);

  if (!user?.is_ngl_displayed) notFound();

  return (
    <UserPageClient
      user={user}
      totalUsers={getTotalUsersQuery}
      session={session?.user}
    />
  );
}
