import { auth } from "@clerk/nextjs";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/header";
import AuthForm from "@/components/auth-form";
import PostSkeleton from "@/components/post-skeleton";

export function generateMetadata(): Metadata {
  const { userId } = auth();

  return {
    title: userId
      ? "Home - CvSU.me"
      : "Welcome! - CvSU.me | Social Media for Cavite State University",
  };
}

export default function Home() {
  const { userId } = auth();

  return (
    <main className="container">
      {userId ? (
        <>
          <Header userId={userId} />
          <div className="space-y-8">
            <PostForm />

            <Suspense
              fallback={
                <div>
                  {[0, 1, 2, 3, 4, 5, 6].map((_, i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <Posts />
            </Suspense>
          </div>
        </>
      ) : (
        <>
          <AuthForm />
          {/* <Auth /> */}
        </>
      )}
    </main>
  );
}
