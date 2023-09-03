import { auth } from "@clerk/nextjs";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import { Suspense } from "react";
import Auth from "@/components/auth";

export default function Home() {
  const { userId } = auth();

  return (
    <main className="container">
      {userId ? (
        <>
          <PostForm />
          hello world
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
