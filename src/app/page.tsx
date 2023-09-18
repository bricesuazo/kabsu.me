import { auth } from "@clerk/nextjs";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import type { Metadata } from "next";
import Header from "@/components/header";
import AuthForm from "@/components/auth-form";
import PostTypeTab from "@/components/post-type-tab";

export function generateMetadata(): Metadata {
  const { userId } = auth();

  return {
    title: userId
      ? "Home - CvSU.me"
      : "Welcome! - CvSU.me | Social Media for Cavite State University",
  };
}

export default function Home({
  searchParams: { tab },
}: {
  searchParams: { tab?: "all" | "program" | "college" };
}) {
  const { userId } = auth();

  return (
    <main className="container">
      {userId ? (
        <>
          <Header />
          <div className="space-y-8">
            <PostForm />

            <PostTypeTab />

            <Posts tab={!tab ? "following" : tab} />
          </div>
        </>
      ) : (
        <AuthForm />
      )}
    </main>
  );
}
