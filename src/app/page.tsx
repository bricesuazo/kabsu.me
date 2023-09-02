import { UserButton, auth } from "@clerk/nextjs";
import Auth from "@/components/auth";
import { ToggleTheme } from "@/components/toggle-theme";

export default function Home() {
  const { userId } = auth();

  return (
    <div className="container">
      <ToggleTheme />
      {userId ? (
        <div>
          <header className="flex items-center justify-between">
            <h1>CvSU.me</h1>
            <UserButton afterSignOutUrl="/" />
          </header>

          <main>
            <h2 className="text-2xl font-bold">Welcome to CvSU.me</h2>
            <p className="text-gray-600">
              This is a social media for Cavite State University.
            </p>
          </main>
        </div>
      ) : (
        <div>
          <Auth />
        </div>
      )}
    </div>
  );
}
