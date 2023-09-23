import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";
import Header from "@/components/header";
import PostForm from "@/components/post-form";
import PostTypeTab from "@/components/post-type-tab";
import Posts from "@/components/posts";
import { auth } from "@clerk/nextjs";

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
  searchParams: { tab?: "all" | "campus" | "program" | "college" };
}) {
  const { userId } = auth();

  const TEST = {
    all: "See posts of all campuses.",
    campus: "See posts of your campus.",
    college: "See posts of your college.",
    program: "See posts of your program.",
  };

  return (
    <main className="container px-0">
      {userId ? (
        <div className="border-x">
          <div className="sticky top-0 z-50 backdrop-blur-lg">
            <Header />

            <PostTypeTab />
          </div>

          <div className="border-b p-3 text-center sm:hidden">
            <p className="text-sm capitalize text-primary">
              {tab ? tab : "following"} tab
            </p>
            <p className="text-xs text-muted-foreground">
              {tab ? TEST[tab] : "See posts of who you are following."}
            </p>
          </div>

          <div className="min-h-screen">
            <PostForm hasRedirect />

            <Posts tab={!tab ? "following" : tab} />
          </div>
        </div>
      ) : (
        <div className="w-full px-4">
          <AuthForm />
        </div>
      )}
    </main>
  );
}
