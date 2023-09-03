import { ToggleTheme } from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";
import { UserButton, currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default async function Header({ userId }: { userId: string | null }) {
  const user = await currentUser();
  return (
    <header className="container flex items-center justify-between py-4">
      <Button variant="link" size="icon" asChild className="px-0">
        <Link href="/">
          <Image src="/logo.png" alt="" width={40} height={40} />
        </Link>
      </Button>
      {user && (
        <Button asChild variant="link">
          <Link href={`/${user.username}`}>My profile</Link>
        </Button>
      )}
      <div className="flex items-center gap-x-2">
        <ToggleTheme />
        {userId && (
          <div className="h-8 w-8">
            <UserButton
              afterSignOutUrl="/"
              signInUrl="/"
              afterSwitchSessionUrl="/"
              afterMultiSessionSingleSignOutUrl="/"
            />
          </div>
        )}
      </div>
    </header>
  );
}
