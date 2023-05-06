import Link from "next/link";
import ThemeButton from "@/components/ThemeButton";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

function Header() {
  return (
    <header className="flex h-16 items-center justify-between bg-slate-100 p-4 dark:bg-slate-900">
      <Link href="/" className="font-bold">
        CvSU.me
      </Link>
      <div className="flex items-center gap-x-2">
        <ThemeButton />
        <SignedOut>
          <SignInButton>
            <Button>Sign in</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

export default Header;
