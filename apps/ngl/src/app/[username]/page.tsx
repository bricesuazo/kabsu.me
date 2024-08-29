import { notFound } from "next/navigation";

import { api } from "~/lib/trpc/server";
import UserPageClient from "./_components/client";

export default async function UserPage({
  params: { username },
}: {
  params: { username: string };
}) {
  const [user, getTotalUsersQuery] = await Promise.all([
    api.ngl.getUser({ username }),
    api.users.getTotalUsers(),
  ]);

  if (!user?.is_ngl_displayed) notFound();

  return <UserPageClient user={user} totalUsers={getTotalUsersQuery} />;
}
