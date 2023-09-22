import { ToggleTheme } from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";
import { auth, SignIn, UserButton } from "@clerk/nextjs";

export default function Home() {
  const { userId } = auth();

  if (!userId)
    return (
      <main className="grid h-full place-items-center">
        <SignIn />
      </main>
    );

  return (
    <main>
      <header className="flex items-center justify-between p-4">
        <Button variant="link" className="h-auto p-0">
          <span className="hidden xs:contents">CvSU.me Admin</span> Dashboard
        </Button>
        <div className="flex items-center gap-x-2">
          <ToggleTheme />
          <UserButton />
        </div>
      </header>

      <div className="container max-w-screen-xl">Test</div>
    </main>
  );
}
