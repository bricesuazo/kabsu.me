import { currentUser } from "@clerk/nextjs";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import { Suspense } from "react";
import Header from "@/components/header";
import Auth from "@/components/auth";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="container">
      <Header />

      {user ? (
        <>
          <h2 className="text-2xl font-bold">Greetings, @{user.username}</h2>

          <PostForm />

          <Suspense fallback="Loading...">
            <Posts />
          </Suspense>
        </>
      ) : (
        <Auth />
      )}
    </main>
  );
}
