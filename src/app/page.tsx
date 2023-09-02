import { UserButton, auth, currentUser } from "@clerk/nextjs";
import Auth from "@/components/auth";
import { ToggleTheme } from "@/components/toggle-theme";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import { Suspense } from "react";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="container">
      <ToggleTheme />
      {user ? (
        <div>
          <header className="flex items-center justify-between">
            <h1>CvSU.me</h1>
            <UserButton afterSignOutUrl="/" />
          </header>

          <main>
            <h2 className="text-2xl font-bold">
              Greetings, @
              {user.username ??
                user.emailAddresses[0].emailAddress.split("@")[0]}
            </h2>

            <PostForm />

            <Suspense fallback="Loading...">
              <Posts />
            </Suspense>
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
