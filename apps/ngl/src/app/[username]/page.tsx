import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { env } from "~/env";
import { api } from "~/lib/trpc/server";
import UserPageClient from "./_components/client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await api.ngl.getUser({ username });

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  const getImageUrl = () => {
    const share_image_url = new URL("/api/user-og", env.NEXT_PUBLIC_NGL_URL);
    share_image_url.searchParams.append("username", username);

    return share_image_url.toString();
  };

  console.log("Image link", getImageUrl());

  return {
    title: `Kabsu.me NGL`,
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
      title: `Kabsu.me NGL`,
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
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [user, getTotalUsersQuery] = await Promise.all([
    api.ngl.getUser({ username }),
    api.users.getTotalUsers(),
  ]);

  if (!user?.is_ngl_displayed) notFound();

  return <UserPageClient user={user} totalUsers={getTotalUsersQuery} />;
}
