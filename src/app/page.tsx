import { auth } from "@clerk/nextjs";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import { Suspense } from "react";
import Auth from "@/components/auth";
import type { Metadata } from "next";

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
