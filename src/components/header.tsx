import { ToggleTheme } from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";
import { UserButton, currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function Header({ userId }: { userId: string | null }) {
  return (
    <header className="flex items-center justify-between py-4">
      <Button variant="link" size="icon" asChild className="px-0">
        <Link href="/">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="object-contain"
          />
        </Link>
      </Button>
      <Suspense
        fallback={
          <Button variant="link" disabled>
            My profile
          </Button>
        }
      >
        <MyProfileButton />
      </Suspense>
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

async function MyProfileButton() {
  const user = await currentUser();
  return (
    <Button asChild variant="link">
      <Link href={`/${user?.username}`}>My profile</Link>
    </Button>
  );
}
