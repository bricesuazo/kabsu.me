import { notFound } from "next/navigation";

import { api } from "~/lib/trpc/server";
import UserPageClient from "./_components/client";

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
