import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@kabsu.me/ui/button";

export default async function FollowsLayout({
  children,
  params,
}: React.PropsWithChildren<{
  params: Promise<{ username: string }>;
}>) {
  const { username } = await params;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="icon">
          <Link href={`/${username}`}>
            <ArrowLeft size="1rem" />
          </Link>
        </Button>
        <h2 className="line-clamp-1 flex-1 truncate text-center">
          @{username}
        </h2>
        <div className="h-10 w-10" />
      </div>
      {children}
    </div>
  );
}
