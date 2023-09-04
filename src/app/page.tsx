import { auth } from "@clerk/nextjs";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/header";
import AuthForm from "@/components/auth-form";

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
          <PostForm />
          <Suspense fallback="Loading...">
            <Posts />
          </Suspense>
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
