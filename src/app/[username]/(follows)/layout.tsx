import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FollowsLayout({
  children,
  params: { username },
}: React.PropsWithChildren<{
  params: { username: string };
}>) {
  return (
    <>
      <Button asChild variant="outline">
        <Link href={`/${username}`}>Back</Link>
      </Button>
      {children}
    </>
  );
}
