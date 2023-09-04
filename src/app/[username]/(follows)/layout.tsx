import { Button } from "@/components/ui/button";
import { clerkClient } from "@clerk/nextjs";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FollowsLayout({
  children,
  params: { username },
}: React.PropsWithChildren<{
  params: { username: string };
}>) {
  const users = await clerkClient.users.getUserList({
    username: [username],
  });

  const user = users[0];

  if (!user) notFound();

  return (
    <div>
      <Button asChild variant="outline">
        <Link href={`/${user.username ?? username}`}>Back</Link>
      </Button>
      {children}
    </div>
  );
}
